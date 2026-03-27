import { useEffect, useState } from "react";
import { bookingApi } from "@/api/bookingApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

interface Booking {
  _id: string;
  service?: { title: string; price: number };
  user?: { name: string; email: string };
  customer?: { name: string; email: string };
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  in_progress: "bg-accent/10 text-accent-foreground",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getProviderBookings();
      setBookings(res.data.bookings || res.data || []);
    } catch { setBookings([]); }
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    try {
      await bookingApi.accept(id);
      toast({ title: "Booking accepted" });
      fetchBookings();
    } catch {
      toast({ title: "Failed to accept", variant: "destructive" });
    }
  };

  const handleComplete = async (id: string) => {
    const otp = otpInputs[id];
    if (!otp) {
      toast({ title: "Please enter OTP", variant: "destructive" });
      return;
    }
    try {
      await bookingApi.complete(id, { otp });
      toast({ title: "Service completed successfully!" });
      fetchBookings();
    } catch {
      toast({ title: "Failed to complete. Check OTP & payment status.", variant: "destructive" });
    }
  };

  const getCustomer = (b: Booking) => b.user || b.customer;
  const canChat = (status: string) => status !== "cancelled";

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-foreground">Provider Bookings</h1>
        <p className="text-xs text-muted-foreground">{bookings.length} bookings</p>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Payment</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No bookings yet</td></tr>
            ) : bookings.map((b) => {
              const customer = getCustomer(b);
              return (
                <tr key={b._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{b.service?.title || "Service"}</p>
                    <p className="text-[10px] text-muted-foreground">₹{b.service?.price || 0}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-foreground">{customer?.name || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{customer?.email || ""}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      b.paymentStatus === "paid" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                    }`}>
                      {b.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusStyle[b.status] || "bg-muted text-muted-foreground"}`}>
                      {b.status === "in_progress" ? "In Progress" : b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "pending" && (
                        <button onClick={() => handleAccept(b._id)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-primary/10 text-primary transition-colors" title="Accept">
                          <Icon icon="solar:verified-check-bold-duotone" className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(b.status === "accepted" || b.status === "in_progress") && (
                        <>
                          <Input
                            placeholder="OTP"
                            className="w-16 h-6 text-[10px]"
                            value={otpInputs[b._id] || ""}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [b._id]: e.target.value })}
                          />
                          <button onClick={() => handleComplete(b._id)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-primary/10 text-primary transition-colors" title="Complete with OTP">
                            <Icon icon="solar:check-read-bold-duotone" className="h-3.5 w-3.5" />
                          </button>
                        </>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderBookingsPage;
