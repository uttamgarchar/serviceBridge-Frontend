import { useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Report { _id: string; subject: string; description: string; status: string; createdAt: string; }

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", bookingId: "" });
  const { toast } = useToast();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try { const res = await reportApi.getMy(); setReports(res.data.reports || res.data || []); }
    catch { setReports([]); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await reportApi.create(form); toast({ title: "Report submitted" }); setShowForm(false); fetchReports(); }
    catch { toast({ title: "Failed to submit", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">My Reports</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" variant={showForm ? "outline" : "default"} className="gap-1.5 text-xs">
          <Icon icon={showForm ? "solar:close-circle-bold-duotone" : "solar:add-circle-bold-duotone"} className="h-3.5 w-3.5" />
          {showForm ? "Cancel" : "New Report"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4 premium-shadow">
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Booking ID</Label><Input value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} className="h-9" required /></div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="h-9" required /></div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <Button type="submit" size="sm" className="gap-1.5"><Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5" />Submit</Button>
        </form>
      )}

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subject</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                <Icon icon="solar:flag-bold-duotone" className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs">No reports filed</p>
              </td></tr>
            ) : reports.map((r) => (
              <tr key={r._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-xs font-semibold text-foreground">{r.subject}</td>
                <td className="px-5 py-3 text-[11px] text-muted-foreground line-clamp-1 max-w-xs">{r.description}</td>
                <td className="px-5 py-3 text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    r.status === "resolved" ? "bg-accent/10 text-accent" :
                    r.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
