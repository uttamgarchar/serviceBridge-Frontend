import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getSettings();
        const settings = res.data.settings || res.data || {};
        setCommission(String(settings.commissionPercentage || settings.commission || ""));
      } catch { /* settings may not exist yet */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateSettings({ commissionPercentage: Number(commission) });
      toast({ title: "Settings updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Platform Settings</h2>

      <div className="rounded-xl bg-card border border-border p-6 premium-shadow max-w-lg space-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commission Percentage (%)</Label>
          <Input type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder="e.g. 10" className="max-w-xs" />
          <p className="text-[10px] text-muted-foreground">Platform commission deducted from each booking payment.</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Icon icon="svg-spinners:ring-resize" className="h-4 w-4" /> : <Icon icon="solar:diskette-bold-duotone" className="h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
