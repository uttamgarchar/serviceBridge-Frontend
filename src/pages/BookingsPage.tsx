import { useEffect, useState } from "react";
import { bookingApi } from "@/api/bookingApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

interface Booking {
  _id: string;
  service?: { title?: string; price?: number };
  provider?: { name?: string };
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  paymentStatus?: string;
  createdAt: string;
  serviceOtp?: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  in_progress: "bg-accent/10 text-accent-foreground",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getUserBookings();
      setBookings(res.data.bookings || res.data || []);
    } catch {
      toast({ title: "Failed to load bookings", variant: "destructive" });
      setBookings([]);
    } finally { setLoading(false); }
  };

  const handleCancel = async (id: string) => {
    try {
      await bookingApi.cancel(id);
      toast({ title: "Booking cancelled" });
      setBookings(p => p.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
    } catch {
      toast({ title: "Failed to cancel", variant: "destructive" });
    }
  };

  const canChat = (status: string) => status !== "cancelled";

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">My Bookings</h1>
          <p className="text-xs text-muted-foreground">{bookings.length} bookings</p>
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Provider</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">OTP</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                No bookings yet. <Link to="/services" className="text-primary hover:underline">Browse services</Link>
              </td></tr>
            ) : bookings.map((b) => (
              <tr key={b._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{b.service?.title || "Service"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{b.provider?.name || "—"}</td>
                <td className="px-4 py-2.5 font-semibold text-foreground">{b.service?.price ? `₹${b.service.price}` : "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusStyle[b.status] || "bg-muted text-muted-foreground"}`}>
                    {b.status === "in_progress" ? "In Progress" : b.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {b.serviceOtp && b.status !== "completed" ? (
                    <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{b.serviceOtp}</span>
                  ) : b.status === "completed" ? (
                    <span className="text-[10px] text-muted-foreground">Verified</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    {(b.status === "pending" || b.status === "accepted" || b.status === "in_progress") && (
                      <button onClick={() => handleCancel(b._id)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" title="Cancel">
                        <Icon icon="solar:close-circle-bold-duotone" className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canChat(b.status) && (
                      <Link to={`/chat?booking=${b._id}`}>
                        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-info/10 text-info transition-colors" title="Chat">
                          <Icon icon="solar:chat-round-dots-bold-duotone" className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    )}
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

export default BookingsPage;
