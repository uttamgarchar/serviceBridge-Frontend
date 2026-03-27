import { useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Complaint {
  _id: string;
  user?: { name?: string; email?: string };
  provider?: { user?: { name?: string } };
  subject?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

const AdminComplaintsPage = () => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await reportApi.getAll();
      const list = res.data.reports || res.data || [];
      setComplaints(list);
      setFiltered(list);
    } catch {
      toast({ title: "Failed to load complaints", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(complaints.filter(c => (c.subject || "").toLowerCase().includes(q) || (c.user?.name || "").toLowerCase().includes(q)));
  }, [search, complaints]);

  const handleResolve = async (id: string) => {
    try { await reportApi.updateStatus(id, { status: "resolved" }); toast({ title: "Complaint resolved" }); fetchComplaints(); }
    catch { toast({ title: "Failed to resolve", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Complaint / Dispute Management</h2>
        <div className="relative w-64">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subject</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-xs">No complaints found</td></tr>
            ) : filtered.map(c => (
              <tr key={c._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{c.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{c.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-xs font-semibold text-foreground">{c.subject || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground truncate max-w-[200px]">{c.description || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                    c.status === "resolved" ? "bg-primary/10 text-primary" :
                    c.status === "pending" ? "bg-warning/10 text-warning" :
                    "bg-secondary text-muted-foreground"
                  }`}>{c.status || "pending"}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 text-right">
                  {c.status !== "resolved" && (
                    <button onClick={() => handleResolve(c._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-primary/10 text-primary transition-colors" title="Resolve">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaintsPage;
