import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Manager {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

const AdminManagersPage = () => {
  const { toast } = useToast();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VerificationManager" });

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getManagers();
      setManagers(res.data.managers || res.data || []);
    } catch {
      toast({ title: "Failed to load managers", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchManagers(); }, []);

  const handleCreate = async () => {
    try {
      await adminApi.createManager(form);
      toast({ title: "Manager created" });
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", role: "VerificationManager" });
      fetchManagers();
    } catch {
      toast({ title: "Failed to create manager", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this manager?")) return;
    try { await adminApi.deleteManager(id); toast({ title: "Manager removed" }); fetchManagers(); }
    catch { toast({ title: "Failed to remove", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Manager Management</h2>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2 text-xs">
          <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4" /> Add Manager
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Created</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {managers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-xs">No managers found</td></tr>
            ) : managers.map(m => (
              <tr key={m._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-xs font-semibold text-foreground">{m.name}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{m.email}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">{m.role}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(m._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Remove">
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Manager</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label className="text-xs">Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VerificationManager">Verification Manager</SelectItem>
                  <SelectItem value="ProviderManager">Provider Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="w-full">Create Manager</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagersPage;
