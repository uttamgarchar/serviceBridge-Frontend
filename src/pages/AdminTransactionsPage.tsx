import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Transaction {
  _id: string;
  user?: { name?: string; email?: string };
  amount?: number;
  type?: string;
  status?: string;
  commission?: number;
  createdAt?: string;
  paymentId?: string;
}

const AdminTransactionsPage = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getTransactions();
        const list = res.data.transactions || res.data || [];
        setTransactions(list);
        setFiltered(list);
      } catch {
        toast({ title: "Failed to load transactions", variant: "destructive" });
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(transactions.filter(t => (t.user?.name || "").toLowerCase().includes(q) || (t.paymentId || "").toLowerCase().includes(q)));
  }, [search, transactions]);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Transactions / Payments</h2>
        <div className="relative w-64">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment ID</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Commission</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-xs">No transactions found</td></tr>
            ) : filtered.map(t => (
              <tr key={t._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{t.user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{t.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{t.paymentId ? t.paymentId.slice(0, 12) + "..." : "—"}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize bg-info/10 text-info">{t.type || "payment"}</span>
                </td>
                <td className="px-5 py-3 text-xs font-semibold text-foreground">₹{t.amount || 0}</td>
                <td className="px-5 py-3 text-xs text-accent font-semibold">₹{t.commission || 0}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                    t.status === "success" || t.status === "completed" ? "bg-primary/10 text-primary" :
                    t.status === "refunded" ? "bg-warning/10 text-warning" :
                    "bg-secondary text-muted-foreground"
                  }`}>{t.status || "—"}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
