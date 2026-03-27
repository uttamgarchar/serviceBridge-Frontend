import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Withdrawal {
  _id: string;
  provider?: { user?: { name: string; email: string } };
  amount: number;
  commission?: number;
  netAmount?: number;
  status: string;
  createdAt?: string;
}

const AdminWithdrawalsPage = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getWithdrawals();
      setWithdrawals(res.data.withdrawals || res.data || []);
    } catch {
      toast({ title: "Failed to load withdrawals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await adminApi.updateWithdrawal(id, { status });
      toast({ title: `Withdrawal ${status}` });
      fetchWithdrawals();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Withdrawal Management</h1>
          <p className="text-xs text-muted-foreground">{withdrawals.length} withdrawal requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWithdrawals} className="text-xs h-8">
          <Icon icon="solar:refresh-bold-duotone" className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Commission</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net Amount</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withdrawals.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No withdrawal requests</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{w.provider?.user?.name || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{w.provider?.user?.email}</p>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">₹{w.amount?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">₹{(w.commission ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">₹{(w.netAmount ?? w.amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize ${
                      w.status === "approved" ? "bg-primary/10 text-primary" :
                      w.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    {w.status === "pending" && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleUpdate(w._id, "approved")} className="h-7 text-[10px] text-primary border-primary/20 hover:bg-primary/10">
                          <Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleUpdate(w._id, "rejected")} className="h-7 text-[10px] text-destructive border-destructive/20 hover:bg-destructive/10">
                          <Icon icon="solar:close-circle-bold-duotone" className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;
