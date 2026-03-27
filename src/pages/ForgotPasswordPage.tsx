import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await authApi.forgotPassword({ email }); toast({ title: "OTP sent to your email" }); setStep("reset"); }
    catch { toast({ title: "Failed to send OTP", variant: "destructive" }); }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await authApi.resetPassword({ email, otp, newPassword }); toast({ title: "Password reset successfully" }); navigate("/login"); }
    catch { toast({ title: "Reset failed", variant: "destructive" }); }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Icon icon="solar:home-smile-bold" className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">ServiceBridge</span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "email" ? "Enter your email to receive OTP" : "Enter OTP and new password"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Email address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-10" required />
            </div>
            <Button type="submit" className="w-full h-10 font-semibold text-sm" disabled={loading}>
              {loading ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 mr-2" /> : null}
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">OTP Code</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="h-10" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-10" required />
            </div>
            <Button type="submit" className="w-full h-10 font-semibold text-sm" disabled={loading}>
              {loading ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 mr-2" /> : null}
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
