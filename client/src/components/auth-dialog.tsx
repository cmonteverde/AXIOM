import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Loader2 } from "lucide-react";
import axiomLogoPath from "@assets/image_(2)_1771052353785.png";

// SVG icons for OAuth providers (inline to avoid extra deps)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10Z"/>
    </svg>
  );
}

function ReplitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 6a4 4 0 0 1 4-4h4v8H4a2 2 0 0 1-2-2V6Zm0 8a2 2 0 0 1 2-2h6v8H6a4 4 0 0 1-4-4v-2Zm12-12h4a4 4 0 0 1 4 4v2a2 2 0 0 1-2 2h-6V2Zm0 20V12h6a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-4Z"/>
    </svg>
  );
}

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [providers, setProviders] = useState<{
    replit: boolean;
    google: boolean;
    github: boolean;
  }>({ replit: true, google: false, github: false });
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => {});
  }, []);

  const handleLogin = (provider: string, url: string) => {
    setLoadingProvider(provider);
    window.location.href = url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-border/50">
        {/* Branded header */}
        <div className="bg-gradient-to-b from-primary/8 via-primary/4 to-transparent px-8 pt-8 pb-4">
          <DialogHeader className="items-center text-center">
            <div className="mb-3">
              <img
                src={axiomLogoPath}
                alt="AXIOM"
                className="w-14 h-14 object-contain mx-auto"
              />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Welcome to AXIOM
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-[280px] mx-auto">
              Sign in to audit your manuscripts against publication standards.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Auth buttons */}
        <div className="px-8 pb-8 pt-4 space-y-3">
          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative justify-center gap-3 border-border hover:bg-accent/50 transition-colors"
            onClick={() => handleLogin("google", providers.google ? "/api/auth/google" : "/api/login")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            Continue with Google
          </Button>

          {/* GitHub */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative justify-center gap-3 border-border hover:bg-accent/50 transition-colors"
            onClick={() => handleLogin("github", providers.github ? "/api/auth/github" : "/api/login")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "github" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GitHubIcon className="w-5 h-5" />
            )}
            Continue with GitHub
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email / Replit */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative justify-center gap-3 border-border hover:bg-accent/50 transition-colors"
            onClick={() => handleLogin("email", "/api/login")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "email" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5 text-muted-foreground" />
            )}
            Continue with Email
          </Button>

          {/* Replit */}
          <Button
            variant="ghost"
            className="w-full h-10 text-xs font-medium relative justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleLogin("replit", "/api/login")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "replit" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ReplitIcon className="w-4 h-4" />
            )}
            Sign in with Replit
          </Button>

          {/* Legal footer */}
          <div className="pt-2">
            <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
              By continuing, you agree to AXIOM's{" "}
              <a href="/terms" className="underline hover:text-muted-foreground transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-muted-foreground transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Shield className="w-3 h-3 text-primary/50" />
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              Your data is encrypted and never shared
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
