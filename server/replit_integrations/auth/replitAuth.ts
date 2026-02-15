import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

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

/**
 * Upsert a user record from any OAuth provider's profile claims.
 */
async function upsertUser(claims: {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}, provider: string) {
  await authStorage.upsertUser({
    id: claims.sub,
    email: claims.email || null,
    firstName: claims.given_name || null,
    lastName: claims.family_name || null,
    profileImageUrl: claims.picture || null,
    authProvider: provider,
  });
}

/**
 * Build a standard session user object from OAuth profile data.
 */
function buildSessionUser(id: string, accessToken: string, refreshToken?: string) {
  return {
    claims: { sub: id },
    access_token: accessToken,
    refresh_token: refreshToken || null,
    expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 1 week
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // ────────────────────────────────────────────────────────────
  // Google OAuth 2.0
  // ────────────────────────────────────────────────────────────
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleConfigured = !!(googleClientId && googleClientSecret);

  if (googleConfigured) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId!,
          clientSecret: googleClientSecret!,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const claims = {
              sub: `google-${profile.id}`,
              email: profile.emails?.[0]?.value,
              given_name: profile.name?.givenName,
              family_name: profile.name?.familyName,
              picture: profile.photos?.[0]?.value,
            };
            await upsertUser(claims, "google");
            done(null, buildSessionUser(claims.sub, accessToken, refreshToken));
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );

    app.get("/api/auth/google", passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    }));

    app.get("/api/auth/google/callback", passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/?auth_error=google",
    }));
  } else {
    // If not configured, return a helpful error instead of crashing
    app.get("/api/auth/google", (_req, res) => {
      res.status(503).json({
        message: "Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // Microsoft OAuth 2.0 (Azure AD / personal Microsoft accounts)
  // ────────────────────────────────────────────────────────────
  const msClientId = process.env.MICROSOFT_CLIENT_ID;
  const msClientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const msConfigured = !!(msClientId && msClientSecret);

  if (msConfigured) {
    // passport-microsoft uses a standard OAuth2 strategy
    const MicrosoftStrategy = (await import("passport-microsoft")).Strategy;
    passport.use(
      new MicrosoftStrategy(
        {
          clientID: msClientId!,
          clientSecret: msClientSecret!,
          callbackURL: "/api/auth/microsoft/callback",
          scope: ["user.read"],
          tenant: "common", // allow personal + work/school accounts
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const claims = {
              sub: `microsoft-${profile.id}`,
              email: profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName,
              given_name: profile.name?.givenName,
              family_name: profile.name?.familyName,
              picture: undefined as string | undefined,
            };
            await upsertUser(claims, "microsoft");
            done(null, buildSessionUser(claims.sub, accessToken, refreshToken));
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );

    app.get("/api/auth/microsoft", passport.authenticate("microsoft", {
      prompt: "select_account",
    }));

    app.get("/api/auth/microsoft/callback", passport.authenticate("microsoft", {
      successRedirect: "/",
      failureRedirect: "/?auth_error=microsoft",
    }));
  } else {
    app.get("/api/auth/microsoft", (_req, res) => {
      res.status(503).json({
        message: "Microsoft sign-in is not configured yet. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.",
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // Email sign-in (placeholder — redirects to Google for now)
  // Full implementation would use magic links via SendGrid/Resend
  // ────────────────────────────────────────────────────────────
  app.get("/api/auth/email", (req, res) => {
    // If Google is configured, use Google (most emails can sign in via Google)
    if (googleConfigured) {
      return res.redirect("/api/auth/google");
    }
    res.status(503).json({
      message: "Email sign-in is not yet available. Please use Google or Microsoft.",
    });
  });

  // ────────────────────────────────────────────────────────────
  // Logout (provider-agnostic)
  // ────────────────────────────────────────────────────────────
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });

  // ────────────────────────────────────────────────────────────
  // Provider availability (so the frontend knows what's live)
  // ────────────────────────────────────────────────────────────
  app.get("/api/auth/providers", (_req, res) => {
    res.json({
      google: googleConfigured,
      microsoft: msConfigured,
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // Session expired and no way to refresh — send to login
  res.status(401).json({ message: "Unauthorized" });
};
