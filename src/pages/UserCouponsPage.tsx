import { useEffect, useState } from "react";
import { couponApi } from "@/api/couponApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Coupon {
  _id: string;
  code: string;
  discount?: number;
  discountType?: string;
  expiryDate?: string;
  isActive?: boolean;
  minOrder?: number;
}

const UserCouponsPage = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await couponApi.getAll();
        setCoupons(res.data.coupons || res.data || []);
      } catch {
        toast({ title: "Failed to load coupons", variant: "destructive" });
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const now = new Date();

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Available Coupons</h2>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Code</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Discount</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Min Order</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Expires</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-xs">No coupons available</td></tr>
            ) : coupons.map(c => {
              const expired = c.expiryDate && new Date(c.expiryDate) < now;
              return (
                <tr key={c._id} className={`hover:bg-secondary/30 transition-colors ${expired ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary font-mono">
                      <Icon icon="solar:tag-price-bold-duotone" className="h-3.5 w-3.5" />
                      {c.code}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-foreground">
                    {c.discountType === "percentage" ? `${c.discount}%` : `₹${c.discount}`}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">₹{c.minOrder || 0}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      expired ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>{expired ? "Expired" : "Active"}</span>
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

export default UserCouponsPage;
