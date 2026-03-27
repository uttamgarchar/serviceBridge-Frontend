import { useEffect, useState } from "react";
import { couponApi } from "@/api/couponApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Coupon { _id: string; code: string; discount: number; discountType: string; discountValue?: number; minAmount?: number; expiresAt: string; expiryDate?: string; isActive: boolean; }

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discountType: "percentage", discountValue: "", minAmount: "", expiryDate: "" });
  const { toast } = useToast();

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try { const res = await couponApi.getAll(); setCoupons(res.data.coupons || res.data || []); }
    catch { setCoupons([]); }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponApi.create({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minAmount: form.minAmount ? Number(form.minAmount) : undefined,
        expiryDate: form.expiryDate,
      });
      toast({ title: "Coupon created successfully" });
      setShowForm(false);
      setForm({ code: "", discountType: "percentage", discountValue: "", minAmount: "", expiryDate: "" });
      fetchCoupons();
    } catch {
      toast({ title: "Failed to create coupon", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Coupon Management</h1>
          <p className="text-xs text-muted-foreground">{coupons.length} coupons</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" variant={showForm ? "outline" : "default"} className="text-xs h-8">
          <Icon icon={showForm ? "solar:close-circle-bold-duotone" : "solar:add-circle-bold-duotone"} className="h-3.5 w-3.5 mr-1" />
          {showForm ? "Cancel" : "Create Coupon"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" className="h-8 text-xs" required />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">Discount Type</Label>
              <Select value={form.discountType} onValueChange={(val) => setForm({ ...form, discountType: val })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">Discount Value</Label>
              <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="e.g. 20" className="h-8 text-xs" required />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">Min Amount (₹)</Label>
              <Input type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} placeholder="Optional" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="h-8 text-xs" required />
            </div>
          </div>
          <Button type="submit" size="sm" className="text-xs h-8 gap-1.5">
            <Icon icon="solar:add-circle-bold-duotone" className="h-3.5 w-3.5" /> Create Coupon
          </Button>
        </form>
      )}

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Code</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Discount</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Min Amount</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expires</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No coupons created yet</td></tr>
            ) : coupons.map((c) => (
              <tr key={c._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5">
                  <span className="font-mono font-semibold text-foreground">{c.code}</span>
                </td>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {(c.discountValue || c.discount)}{c.discountType === "percentage" ? "%" : "₹"} off
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.minAmount ? `₹${c.minAmount}` : "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{new Date(c.expiryDate || c.expiresAt).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {c.isActive ? "Active" : "Expired"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCouponsPage;
