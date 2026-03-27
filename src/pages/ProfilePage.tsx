import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userApi } from "@/api/userApi";
import { providerApi } from "@/api/providerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

type ProviderStatus = "none" | "pending" | "rejected" | "approved";

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openApply, setOpenApply] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>("none");
  const [documentStatus, setDocumentStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [applyData, setApplyData] = useState({ serviceType: "", address: "", city: "", pincode: "" });

  const loadProviderStatus = async () => {
    try {
      const res = await providerApi.getMyProviderProfile();
      if (!res.data.success) return;
      const profile = res.data.profile;
      if (!profile) { setProviderStatus("none"); setDocumentStatus("none"); return; }
      setProviderStatus(profile.verificationStatus || "pending");
      setDocumentStatus(profile.documentStatus || "pending");
    } catch {}
  };

  useEffect(() => { loadProviderStatus(); }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { const res = await userApi.updateProfile({ name, phone, address }); setUser(res.data.user || { ...user!, name, phone, address }); toast({ title: "Profile updated" }); }
    catch { toast({ title: "Update failed", variant: "destructive" }); }
    setLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await providerApi.apply(applyData); setProviderStatus("pending"); setDocumentStatus("pending"); toast({ title: "Application submitted" }); setOpenApply(false); }
    catch { toast({ title: "Application failed", variant: "destructive" }); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Profile Table */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Profile Information</h3>
          {user?.role === "User" && providerStatus === "none" && (
            <Button onClick={() => setOpenApply(true)} size="sm" variant="outline" className="text-xs h-7">
              <Icon icon="solar:case-round-bold-duotone" className="h-3 w-3 mr-1" /> Become Provider
            </Button>
          )}
        </div>
        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            {[
              { label: "Name", value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Role", value: user?.role, badge: true },
              { label: "Phone", value: user?.phone || "—" },
              { label: "Address", value: user?.address || "—" },
            ].map(row => (
              <tr key={row.label} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground w-32">{row.label}</td>
                <td className="px-4 py-2.5 text-foreground">
                  {row.badge ? <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-primary/8 text-primary">{row.value}</span> : row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="rounded-lg bg-card border border-border p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground">Edit Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Email</Label><Input value={user?.email || ""} disabled className="h-8 text-xs bg-muted" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-8 text-xs" /></div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm" className="text-xs h-8">
            {loading ? <Icon icon="svg-spinners:ring-resize" className="h-3 w-3 mr-1" /> : null}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Provider Status */}
      {providerStatus !== "none" && (
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground">Provider Status</h3>
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground w-32">Verification</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    providerStatus === "approved" ? "bg-primary/10 text-primary" :
                    providerStatus === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>{providerStatus}</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground">Documents</td>
                <td className="px-4 py-2.5 flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    documentStatus === "approved" ? "bg-primary/10 text-primary" :
                    documentStatus === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>{documentStatus}</span>
                  {(documentStatus === "pending" || documentStatus === "rejected") && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => (window.location.href = "/provider/upload-documents")}>
                      {documentStatus === "rejected" ? "Reupload" : "Upload"}
                    </Button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Modal */}
      <Dialog open={openApply} onOpenChange={setOpenApply}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Apply as Service Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-3">
            <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Service Type</Label><Input value={applyData.serviceType} onChange={(e) => setApplyData({ ...applyData, serviceType: e.target.value })} className="h-8 text-xs" required /></div>
            <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Address</Label><Input value={applyData.address} onChange={(e) => setApplyData({ ...applyData, address: e.target.value })} className="h-8 text-xs" required /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">City</Label><Input value={applyData.city} onChange={(e) => setApplyData({ ...applyData, city: e.target.value })} className="h-8 text-xs" required /></div>
              <div className="space-y-1"><Label className="text-[10px] font-medium text-muted-foreground">Pincode</Label><Input value={applyData.pincode} onChange={(e) => setApplyData({ ...applyData, pincode: e.target.value })} className="h-8 text-xs" required /></div>
            </div>
            <Button className="w-full h-8 text-xs font-semibold">Submit Application</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
