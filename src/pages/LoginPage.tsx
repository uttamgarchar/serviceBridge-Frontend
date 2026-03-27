import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative bg-card">
        <div className="relative z-10 max-w-md px-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Icon icon="solar:home-smile-bold" className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ServiceBridge</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Quality home services,<br />on demand
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Experienced, hand-picked professionals to serve you at your doorstep. Book trusted services instantly.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { icon: "solar:shield-check-bold-duotone", title: "Verified Professionals", desc: "Background checked & trained" },
              { icon: "solar:tag-price-bold-duotone", title: "Transparent Pricing", desc: "No hidden charges, ever" },
              { icon: "solar:star-bold-duotone", title: "Quality Assured", desc: "100% satisfaction guaranteed" },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon icon={f.icon} className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Icon icon="solar:home-smile-bold" className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">ServiceBridge</span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Icon icon={showPwd ? "solar:eye-bold" : "solar:eye-closed-bold"} className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 font-semibold text-sm" disabled={loading}>
              {loading ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 mr-2" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="flex justify-between text-xs">
            <Link to="/forgot-password" className="text-primary font-medium hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
