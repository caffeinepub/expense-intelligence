import { Shield, TrendingUp, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Expense Intelligence
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-powered financial insights
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {[
            {
              icon: TrendingUp,
              label: "Track spending & budgets",
              color: "text-blue-400",
            },
            {
              icon: Zap,
              label: "AI-powered saving recommendations",
              color: "text-yellow-400",
            },
            {
              icon: Shield,
              label: "Secure & private by design",
              color: "text-green-400",
            },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <Button
          data-ocid="login.primary_button"
          className="w-full h-12 text-base font-semibold"
          onClick={login}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Connecting..." : "Connect with Internet Identity"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your data is securely stored on the Internet Computer blockchain.
        </p>
      </div>
    </div>
  );
}
