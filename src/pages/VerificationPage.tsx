import { useEffect, useState } from "react";
import { verificationApi } from "@/api/verificationApi";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Provider { _id: string; serviceType: string; city: string; user?: { name: string; email: string }; documentStatus: string; }
interface Document { _id: string; type: string; url: string; }

const VerificationPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);

  const fetchPending = async () => {
    try { setLoading(true); const res = await verificationApi.getPending(); const list = res.data.providers || []; setProviders(list); setFiltered(list); }
    catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(providers.filter(p => ((p.serviceType || "") + (p.city || "") + (p.user?.name || "")).toLowerCase().includes(q)));
  }, [search, providers]);

  const handleViewDocs = async (id: string) => {
    try { setDocLoading(true); setDocuments([]); setOpenDocs(true); const res = await verificationApi.getProviderDetails(id); setDocuments(res.data.provider?.documents || []); }
    catch { toast({ title: "Failed to load docs", variant: "destructive" }); }
    finally { setDocLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try { await verificationApi.approve(id); toast({ title: "Approved" }); fetchPending(); }
    catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  const handleReject = async (id: string) => {
    try { await verificationApi.reject(id); toast({ title: "Rejected" }); fetchPending(); }
    catch { toast({ title: "Failed", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Provider Verification</h1>
          <p className="text-xs text-muted-foreground">{filtered.length} pending</p>
        </div>
        <div className="relative w-52">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">City</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Provider</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No pending providers</td></tr>
            ) : filtered.map((p) => (
              <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{p.serviceType}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.city}</td>
                <td className="px-4 py-2.5">
                  <p className="text-foreground">{p.user?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.user?.email}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-warning/10 text-warning">{p.documentStatus}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => handleViewDocs(p._id)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-info/10 text-info transition-colors" title="Docs">
                      <Icon icon="solar:eye-bold-duotone" className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleApprove(p._id)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-primary/10 text-primary transition-colors" title="Approve">
                      <Icon icon="solar:verified-check-bold-duotone" className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleReject(p._id)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" title="Reject">
                      <Icon icon="solar:close-circle-bold-duotone" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={openDocs} onOpenChange={setOpenDocs}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="text-sm">Documents</DialogTitle></DialogHeader>
          {docLoading ? (
            <div className="flex justify-center py-8"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>
          ) : documents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No documents</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div key={doc._id} className="border border-border rounded-md p-2.5">
                  <p className="text-[10px] font-semibold mb-1.5">{doc.type}</p>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img src={doc.url} alt={doc.type} className="rounded w-full hover:opacity-80 transition-opacity" />
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

export default VerificationPage;
