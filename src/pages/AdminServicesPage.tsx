import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { discoveryApi } from "@/api/discoveryApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Service {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  provider?: { name?: string; email?: string } | string;
}

const AdminServicesPage = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await discoveryApi.getAllServices();
      const list = res.data.services || res.data || [];
      setServices(list);
      setFiltered(list);
    } catch {
      toast({ title: "Failed to load services", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(services.filter(s => (s.name || "").toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q)));
  }, [search, services]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try { await adminApi.deleteService(id); toast({ title: "Service deleted" }); fetchServices(); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Services Management</h2>
        <div className="relative w-64">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-xs">No services found</td></tr>
            ) : filtered.map(s => (
              <tr key={s._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{s.description}</p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{s.category || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {typeof s.provider === "object" ? s.provider?.name || "—" : s.provider || "—"}
                </td>
                <td className="px-5 py-3 text-xs font-semibold text-foreground">₹{s.price || 0}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(s._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminServicesPage;
