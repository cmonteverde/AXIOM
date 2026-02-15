import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any, provider: string = "replit") {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"] || claims["given_name"],
    lastName: claims["last_name"] || claims["family_name"],
    profileImageUrl: claims["profile_image_url"] || claims["picture"],
    authProvider: provider,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // ── Serialize / Deserialize ──
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // ── Replit OpenID Connect ──
  const config = await getOidcConfig();

  const replitVerify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims(), "replit");
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        replitVerify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  // Replit auth routes
  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // ── Google OAuth 2.0 ──
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const googleUser: any = {
              claims: {
                sub: `google-${profile.id}`,
                email,
                given_name: profile.name?.givenName || "",
                family_name: profile.name?.familyName || "",
                picture: profile.photos?.[0]?.value || "",
              },
              access_token: _accessToken,
              refresh_token: _refreshToken,
              expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
            };

            await upsertUser(googleUser.claims, "google");
            done(null, googleUser);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );

    app.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
      })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/?auth_error=google",
      })
    );
  }

  // ── GitHub OAuth 2.0 (using generic OAuth2) ──
  // GitHub support can be added by setting GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
  // For now, the frontend shows the button but routes to a config-needed page

  // ── Provider availability endpoint ──
  app.get("/api/auth/providers", (_req, res) => {
    res.json({
      replit: true,
      google: !!(googleClientId && googleClientSecret),
      github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
