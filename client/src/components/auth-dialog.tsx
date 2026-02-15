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

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [providers, setProviders] = useState<{
    google: boolean;
    microsoft: boolean;
  }>({ google: false, microsoft: false });
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
          {/* Google — primary */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative justify-center gap-3 border-border hover:bg-accent/50 transition-colors"
            onClick={() => handleLogin("google", "/api/auth/google")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            Continue with Google
          </Button>

          {/* Microsoft */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative justify-center gap-3 border-border hover:bg-accent/50 transition-colors"
            onClick={() => handleLogin("microsoft", "/api/auth/microsoft")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "microsoft" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MicrosoftIcon className="w-5 h-5" />
            )}
            Continue with Microsoft
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative justify-center gap-3 border-border hover:bg-accent/50 transition-colors"
            onClick={() => handleLogin("email", "/api/auth/email")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "email" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5 text-muted-foreground" />
            )}
            Continue with Email
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
