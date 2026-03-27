import { useEffect, useState } from "react";
import { discoveryApi } from "@/api/discoveryApi";
import { useAuthStore } from "@/stores/authStore";
import { bookingApi } from "@/api/bookingApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Service {
  _id: string; title: string; description: string; category: string; price: number;
  provider?: { name: string; _id: string; city?: string }; averageRating?: number;
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookingService, setBookingService] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async (query?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.search = query;
      const res = await discoveryApi.getAllServices(params);
      setServices(res.data.services || res.data || []);
    } catch { setServices([]); }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchServices(search); };

  const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000));

  const handleBook = async (service: Service) => {
    setBookingService(service._id);
    try {
      const otp = generateOtp();
      await bookingApi.create({
        service: service._id,
        provider: service.provider?._id || "",
        priceAtBooking: service.price,
        serviceOtp: otp,
      });
      toast({ title: "Booking created!", description: `Your service OTP is: ${otp}. Share it with the provider to complete the service.` });
    } catch {
      toast({ title: "Booking failed", variant: "destructive" });
    }
    setBookingService(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Browse Services</h1>
          <p className="text-xs text-muted-foreground">{services.length} services available</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="pl-9 h-9 text-xs" />
        </div>
        <Button type="submit" variant="outline" size="sm" className="text-xs h-9">Search</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Icon icon="solar:magnifer-zoom-in-bold-duotone" className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
          <p className="text-xs">No services found</p>
        </div>
      ) : (
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Service</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Provider</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Rating</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Price</th>
                {user?.role === "User" && <th className="px-4 py-2.5 text-right text-[10px] font-medium text-muted-foreground">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((s) => (
                <tr key={s._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary">{s.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.provider?.name || "—"}{s.provider?.city ? ` · ${s.provider.city}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {s.averageRating ? (
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:star-bold" className="h-3 w-3 text-primary" />
                        <span className="font-semibold text-foreground">{s.averageRating.toFixed(1)}</span>
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">₹{s.price}</td>
                  {user?.role === "User" && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleBook(s)}
                        disabled={bookingService === s._id}
                        className="h-7 px-2.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {bookingService === s._id ? "Booking..." : "Book"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
