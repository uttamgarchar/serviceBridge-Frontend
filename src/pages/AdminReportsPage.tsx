import { useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Report {
  _id: string;
  raisedBy?: { name: string; email: string };
  against?: { name: string; email: string };
  reason: string;
  status: string;
  adminRemark?: string;
  createdAt: string;
  subject?: string;
  description?: string;
  reportedBy?: { name: string };
}

const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try { const res = await reportApi.getAll(); setReports(res.data.reports || res.data || []); }
    catch { setReports([]); }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await reportApi.updateStatus(id, { status, adminRemark: remarks[id] || undefined } as any);
      toast({ title: `Status updated to ${status}` });
      fetchReports();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Report / Complaint Management</h1>
          <p className="text-xs text-muted-foreground">{reports.length} reports</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports} className="text-xs h-8">
          <Icon icon="solar:refresh-bold-duotone" className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Raised By</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Against</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admin Remark</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No reports</td></tr>
              ) : reports.map((r) => (
                <tr key={r._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{r.raisedBy?.name || r.reportedBy?.name || "Unknown"}</p>
                    <p className="text-[10px] text-muted-foreground">{r.raisedBy?.email || ""}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{r.against?.name || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{r.against?.email || ""}</p>
                  </td>
                  <td className="px-4 py-2.5 max-w-[200px]">
                    <p className="text-foreground line-clamp-2">{r.reason || r.subject || "—"}</p>
                    {r.description && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{r.description}</p>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      r.status === "resolved" ? "bg-primary/10 text-primary" :
                      r.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      r.status === "in_review" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      value={remarks[r._id] ?? r.adminRemark ?? ""}
                      onChange={(e) => setRemarks({ ...remarks, [r._id]: e.target.value })}
                      placeholder="Add remark..."
                      className="h-7 text-[10px] w-36"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Select onValueChange={(val) => handleStatusChange(r._id, val)}>
                      <SelectTrigger className="w-28 ml-auto h-7 text-[10px]"><SelectValue placeholder="Update" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
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

export default AdminReportsPage;
