import { useEffect, useState } from "react";
import { verificationApi } from "@/api/verificationApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Provider {
  _id: string;
  serviceType?: string;
  city?: string;
  user?: { name: string; email: string };
  createdAt?: string;
}

interface Document { _id: string; type: string; url: string; }

interface Analytics {
  totalPending?: number;
  totalApproved?: number;
  totalRejected?: number;
  totalProviders?: number;
}

const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) => (
  <div className="rounded-lg bg-card border border-border p-4">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-md flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon icon={icon} className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

const AdminVerificationPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openDocs, setOpenDocs] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, analyticsRes] = await Promise.all([
        verificationApi.getPending(),
        verificationApi.analytics().catch(() => ({ data: {} })),
      ]);
      setProviders(pendingRes.data.providers || pendingRes.data || []);
      setAnalytics(analyticsRes.data || {});
    } catch {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewDocs = async (providerId: string) => {
    try {
      setDocLoading(true);
      setDocuments([]);
      setOpenDocs(true);
      const res = await verificationApi.getProviderDetails(providerId);
      setDocuments(res.data.provider?.documents || res.data.documents || []);
    } catch {
      toast({ title: "Failed to load documents", variant: "destructive" });
    } finally { setDocLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await verificationApi.approve(id);
      toast({ title: "Provider approved" });
      fetchData();
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await verificationApi.reject(rejectDialog);
      toast({ title: "Provider rejected" });
      setRejectDialog(null);
      setRejectReason("");
      fetchData();
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Provider Verification</h1>
          <p className="text-xs text-muted-foreground">{providers.length} pending verifications</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="text-xs h-8">
          <Icon icon="solar:refresh-bold-duotone" className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending" value={analytics.totalPending ?? providers.length} icon="solar:hourglass-bold-duotone" color="hsl(36, 100%, 57%)" />
        <StatCard label="Approved" value={analytics.totalApproved ?? 0} icon="solar:verified-check-bold-duotone" color="hsl(158, 64%, 52%)" />
        <StatCard label="Rejected" value={analytics.totalRejected ?? 0} icon="solar:close-circle-bold-duotone" color="hsl(0, 72%, 51%)" />
        <StatCard label="Total Providers" value={analytics.totalProviders ?? 0} icon="solar:users-group-rounded-bold-duotone" color="hsl(217, 91%, 60%)" />
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Service</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Applied</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No pending verifications</td></tr>
              ) : providers.map(p => (
                <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{p.user?.name || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{p.user?.email}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.serviceType || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.city || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleViewDocs(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-info/10 text-info transition-colors" title="View Documents">
                        <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                      </button>
                      <Button size="sm" variant="outline" onClick={() => handleApprove(p._id)} className="h-7 text-[10px] text-primary border-primary/20 hover:bg-primary/10">
                        <Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setRejectDialog(p._id); setRejectReason(""); }} className="h-7 text-[10px] text-destructive border-destructive/20 hover:bg-destructive/10">
                        <Icon icon="solar:close-circle-bold-duotone" className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Dialog */}
      <Dialog open={openDocs} onOpenChange={setOpenDocs}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Provider Documents</DialogTitle></DialogHeader>
          {docLoading ? (
            <div className="flex justify-center py-10"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documents uploaded</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="border border-border rounded-lg p-3">
                  <p className="text-xs font-semibold mb-2 text-foreground">{doc.type}</p>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img src={doc.url} alt={doc.type} className="rounded-md w-full cursor-pointer hover:opacity-80 transition-opacity" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Provider</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Provide a reason for rejection:</p>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="text-xs" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setRejectDialog(null)} className="text-xs">Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleReject} className="text-xs">Reject Provider</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerificationPage;
