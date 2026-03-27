import { useEffect, useState } from "react";
import { verificationApi } from "@/api/verificationApi";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Provider {
  _id: string;
  serviceType?: string;
  city?: string;
  user?: { name: string; email: string };
  status?: string;
  experience?: string;
  documents?: { type: string; url: string }[];
}

const PMApplicationsPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Provider | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await verificationApi.getPending();
      const list = res.data.providers || res.data || [];
      setProviders(list);
      setFiltered(list);
    } catch {
      toast({ title: "Failed to load applications", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProviders(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(providers.filter(p => (p.user?.name || "").toLowerCase().includes(q) || (p.serviceType || "").toLowerCase().includes(q)));
  }, [search, providers]);

  const handleApprove = async (id: string) => {
    try { await verificationApi.approve(id); toast({ title: "Provider approved" }); fetchProviders(); }
    catch { toast({ title: "Failed to approve", variant: "destructive" }); }
  };

  const handleReject = async (id: string) => {
    try { await verificationApi.reject(id); toast({ title: "Provider rejected" }); fetchProviders(); }
    catch { toast({ title: "Failed to reject", variant: "destructive" }); }
  };

  const viewDetails = async (id: string) => {
    try {
      const res = await verificationApi.getProviderDetails(id);
      setSelected(res.data.provider || res.data);
    } catch {
      toast({ title: "Failed to load details", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Provider Applications</h2>
        <div className="relative w-64">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Applicant</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service Type</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">City</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-xs">No applications found</td></tr>
            ) : filtered.map(p => (
              <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{p.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{p.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.serviceType || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.city || "—"}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-warning/10 text-warning capitalize">{p.status || "pending"}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => viewDetails(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-info/10 text-info transition-colors" title="View Details">
                      <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleApprove(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-primary/10 text-primary transition-colors" title="Approve">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleReject(p._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Reject">
                      <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Provider Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase">Name</p><p className="font-semibold text-foreground">{selected.user?.name}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Email</p><p className="font-semibold text-foreground">{selected.user?.email}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Service</p><p className="font-semibold text-foreground">{selected.serviceType}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">City</p><p className="font-semibold text-foreground">{selected.city}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Experience</p><p className="font-semibold text-foreground">{selected.experience || "—"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Status</p><p className="font-semibold text-foreground capitalize">{selected.status}</p></div>
              </div>
              {selected.documents && selected.documents.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Documents</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.documents.map((doc, i) => (
                      <div key={i} className="border border-border rounded-lg p-3">
                        <p className="text-[10px] font-semibold mb-1">{doc.type}</p>
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <img src={doc.url} alt={doc.type} className="rounded w-full cursor-pointer hover:opacity-80" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMApplicationsPage;
