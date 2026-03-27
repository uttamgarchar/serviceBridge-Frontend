import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      await authApi.resetPassword({ email: user?.email || "", otp: currentPassword, newPassword });
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Failed to change password", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Settings</h2>

      <div className="rounded-xl bg-card border border-border p-6 premium-shadow max-w-lg">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon icon="solar:lock-keyhole-bold-duotone" className="h-4 w-4 text-primary" />
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Current Password / OTP</Label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">New Password</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4" /> : <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4" />}
            Update Password
          </Button>
        </form>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 premium-shadow max-w-lg">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon icon="solar:bell-bing-bold-duotone" className="h-4 w-4 text-primary" />
          Notifications
        </h3>
        <p className="text-xs text-muted-foreground">Notification settings will be available in a future update.</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 premium-shadow max-w-lg">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon icon="solar:shield-warning-bold-duotone" className="h-4 w-4 text-destructive" />
          Security
        </h3>
        <p className="text-xs text-muted-foreground">Security settings will be available in a future update.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
