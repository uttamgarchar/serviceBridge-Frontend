import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Provider {
  _id: string;
  user?: { _id: string; name: string; email: string };
  serviceType?: string;
  city?: string;
  status?: string;
  verificationStatus?: string;
  ratings?: number;
  totalEarnings?: number;
  services?: unknown[];
}

const AdminProvidersPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Provider | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllProviders();
      const list = res.data.providers || res.data || [];
      setProviders(list);
      setFiltered(list);
    } catch {
      toast({ title: "Failed to load providers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(providers.filter(p =>
      (p.user?.name || "").toLowerCase().includes(q) ||
      (p.user?.email || "").toLowerCase().includes(q) ||
      (p.serviceType || "").toLowerCase().includes(q)
    ));
  }, [search, providers]);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Provider Management</h1>
          <p className="text-xs text-muted-foreground">{filtered.length} providers</p>
        </div>
        <div className="relative w-64">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search providers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Service Type</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verification</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ratings</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No providers found</td></tr>
              ) : filtered.map(p => (
                <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{p.user?.name || "N/A"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.user?.email || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.serviceType || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      (p.verificationStatus || p.status) === "approved" ? "bg-primary/10 text-primary" :
                      (p.verificationStatus || p.status) === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{p.verificationStatus || p.status || "pending"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:star-bold" className="h-3 w-3 text-accent" />
                      <span className="font-semibold text-foreground">{p.ratings != null ? p.ratings.toFixed(1) : "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setSelected(p)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-info/10 text-info transition-colors" title="View">
                      <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Provider Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[10px] text-muted-foreground uppercase">Name</p><p className="font-semibold text-foreground">{selected.user?.name}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Email</p><p className="font-semibold text-foreground">{selected.user?.email}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Service Type</p><p className="font-semibold text-foreground">{selected.serviceType || "—"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Verification</p><p className="font-semibold text-foreground">{selected.verificationStatus || selected.status || "pending"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Ratings</p><p className="font-semibold text-foreground">{selected.ratings != null ? selected.ratings.toFixed(1) : "—"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Total Earnings</p><p className="font-semibold text-foreground">₹{selected.totalEarnings || 0}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProvidersPage;
