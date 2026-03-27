import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Provider {
  _id: string;
  user?: { name?: string; email?: string };
  serviceType?: string;
  city?: string;
  status?: string;
  rejectionReason?: string;
}

const PMRejectedPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getAllProviders();
        const all = res.data.providers || res.data || [];
        setProviders(all.filter((p: Provider) => p.status === "rejected"));
      } catch {
        toast({ title: "Failed to load providers", variant: "destructive" });
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Rejected Providers</h2>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service Type</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">City</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {providers.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-xs">No rejected providers</td></tr>
            ) : providers.map(p => (
              <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{p.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{p.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.serviceType || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.city || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.rejectionReason || "No reason provided"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PMRejectedPage;
