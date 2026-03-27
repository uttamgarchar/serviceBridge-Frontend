import { useEffect, useState } from "react";
import { verificationApi } from "@/api/verificationApi";
import { providerDocApi } from "@/api/providerDocApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Provider {
  _id: string;
  serviceType?: string;
  city?: string;
  user?: { name: string; email: string };
  documentStatus?: string;
  createdAt?: string;
}

interface Document { _id: string; type: string; url: string; }

const VMPendingPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openDocs, setOpenDocs] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await verificationApi.getPending();
      setProviders(res.data.providers || res.data || []);
    } catch {
      toast({ title: "Failed to load pending documents", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleViewDocs = async (providerId: string) => {
    try {
      setDocLoading(true);
      setDocuments([]);
      setOpenDocs(true);
      const res = await providerDocApi.getProviderDocuments(providerId);
      setDocuments(res.data.documents || res.data || []);
    } catch {
      toast({ title: "Failed to load docs", variant: "destructive" });
    } finally { setDocLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try { await verificationApi.approve(id); toast({ title: "Approved" }); fetchPending(); }
    catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const handleReject = async (id: string) => {
    try { await verificationApi.reject(id); toast({ title: "Rejected" }); fetchPending(); }
    catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Pending Documents</h2>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">City</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Upload Date</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {providers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-xs">No pending documents</td></tr>
            ) : providers.map(p => (
              <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{p.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{p.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.serviceType || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.city || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => handleViewDocs(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-info/10 text-info" title="View Docs">
                      <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleApprove(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-primary/10 text-primary" title="Approve">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleReject(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive" title="Reject">
                      <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={openDocs} onOpenChange={setOpenDocs}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Documents</DialogTitle></DialogHeader>
          {docLoading ? (
            <div className="flex justify-center py-10"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documents</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="border border-border rounded-lg p-3">
                  <p className="text-xs font-semibold mb-2">{doc.type}</p>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img src={doc.url} alt={doc.type} className="rounded-md w-full cursor-pointer hover:opacity-80" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VMPendingPage;
