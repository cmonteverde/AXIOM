import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import ProfileSetup from "@/pages/profile-setup";
import Dashboard from "@/pages/dashboard";
import NewManuscript from "@/pages/new-manuscript";
import ManuscriptWorkspace from "@/pages/manuscript-workspace";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/setup" component={ProfileSetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/manuscript/new" component={NewManuscript} />
      <Route path="/manuscript/:id" component={ManuscriptWorkspace} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
