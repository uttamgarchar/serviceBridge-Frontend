import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Booking {
  _id: string;
  user?: { name?: string; email?: string };
  provider?: { user?: { name?: string } };
  service?: { name?: string };
  status?: string;
  price?: number;
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminBookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllBookings();
      const list = res.data.bookings || res.data || [];
      setBookings(list);
      setFiltered(list);
    } catch {
      toast({ title: "Failed to load bookings", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    let list = bookings;
    if (statusFilter !== "all") list = list.filter(b => b.status === statusFilter);
    const q = search.toLowerCase();
    if (q) list = list.filter(b => (b.user?.name || "").toLowerCase().includes(q) || (b.service?.name || "").toLowerCase().includes(q));
    setFiltered(list);
  }, [search, statusFilter, bookings]);

  const handleCancel = async (id: string) => {
    try { await adminApi.cancelBooking(id); toast({ title: "Booking cancelled" }); fetchBookings(); }
    catch { toast({ title: "Failed to cancel", variant: "destructive" }); }
  };

  const handleRefund = async (id: string) => {
    try { await adminApi.refundBooking(id); toast({ title: "Refund initiated" }); fetchBookings(); }
    catch { toast({ title: "Failed to refund", variant: "destructive" }); }
  };

  const statuses = ["all", "pending", "accepted", "in-progress", "completed", "cancelled"];

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Booking Management</h2>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
        <div className="flex gap-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-xs">No bookings found</td></tr>
            ) : filtered.map(b => (
              <tr key={b._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{b.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{b.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{b.service?.name || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{b.provider?.user?.name || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${statusColors[b.status || ""] || "bg-secondary text-muted-foreground"}`}>{b.status}</span>
                </td>
                <td className="px-5 py-3 text-xs font-semibold text-foreground">₹{b.price || 0}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    {b.status !== "cancelled" && b.status !== "completed" && (
                      <button onClick={() => handleCancel(b._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Cancel">
                        <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleRefund(b._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-warning/10 text-warning transition-colors" title="Refund">
                      <Icon icon="solar:undo-left-bold-duotone" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
