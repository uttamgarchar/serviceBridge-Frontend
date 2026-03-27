import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const VerifyOtpPage = () => {
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await authApi.verifyOtp({ email, otp }); toast({ title: "Account verified!" }); navigate("/login"); }
    catch { toast({ title: "Verification failed", variant: "destructive" }); }
    setLoading(false);
  };

  const handleResend = async () => {
    try { await authApi.resendOtp({ email }); toast({ title: "OTP resent" }); }
    catch { toast({ title: "Failed to resend", variant: "destructive" }); }
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
          <h1 className="text-xl font-bold text-foreground">Verify Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the OTP sent to your email</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Email address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">OTP Code</Label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="h-10" required />
          </div>
          <Button type="submit" className="w-full h-10 font-semibold text-sm" disabled={loading}>
            {loading ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 mr-2" /> : null}
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <button onClick={handleResend} className="w-full text-center text-xs text-primary font-medium hover:underline">
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
