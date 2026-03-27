import { useEffect, useState } from "react";
import { providerApi } from "@/api/providerApi";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ProviderProfile {
  totalEarnings?: number;
  walletBalance?: number;
  monthlyEarnings?: { month: string; amount: number }[];
  completedBookings?: number;
}

const ProviderEarningsPage = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProviderProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await providerApi.getMyProviderProfile();
        setProfile(res.data.provider || res.data || {});
      } catch {
        toast({ title: "Failed to load earnings", variant: "destructive" });
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  const stats = [
    { label: "Total Earnings", value: `₹${profile.totalEarnings || 0}`, icon: "solar:hand-money-bold-duotone", color: "hsl(var(--stat-1))" },
    { label: "Wallet Balance", value: `₹${profile.walletBalance || 0}`, icon: "solar:wallet-bold-duotone", color: "hsl(var(--stat-2))" },
    { label: "Completed Jobs", value: profile.completedBookings || 0, icon: "solar:check-circle-bold-duotone", color: "hsl(var(--stat-3))" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground font-display">Earnings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-5 premium-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <Icon icon={s.icon} className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</p>
                <p className="text-lg font-extrabold text-foreground font-display">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {profile.monthlyEarnings && profile.monthlyEarnings.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 premium-shadow">
          <h3 className="text-sm font-bold text-foreground mb-4">Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={profile.monthlyEarnings}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(252, 56%, 62%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(252, 56%, 62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220,9%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(220,9%,55%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: "none", background: "hsl(222, 41%, 10%)", color: "hsl(220, 20%, 92%)" }} />
              <Area type="monotone" dataKey="amount" stroke="hsl(252, 56%, 62%)" fill="url(#earnGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProviderEarningsPage;
