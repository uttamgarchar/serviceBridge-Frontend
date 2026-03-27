import { useEffect, useState } from "react";
import { providerApi } from "@/api/providerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Service { _id: string; title: string; description: string; category: string; price: number; isActive: boolean; }

const ProviderServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", price: "" });
  const { toast } = useToast();

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    try { const res = await providerApi.getMyServices(); setServices(res.data.services || res.data || []); }
    catch { setServices([]); }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await providerApi.addService({ name: form.title, description: form.description, category: form.category, price: Number(form.price) });
      toast({ title: "Service added" }); setShowForm(false); setForm({ title: "", description: "", category: "", price: "" }); fetchServices();
    } catch { toast({ title: "Failed to add service", variant: "destructive" }); }
  };

  const handleEdit = (s: Service) => {
    setEditingService(s);
    setForm({ title: s.title, description: s.description, category: s.category, price: String(s.price) });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await providerApi.updateService(editingService._id, { name: form.title, description: form.description, category: form.category, price: Number(form.price) });
      toast({ title: "Service updated" }); setEditingService(null); setForm({ title: "", description: "", category: "", price: "" }); fetchServices();
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">My Services</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" variant={showForm ? "outline" : "default"} className="gap-1.5 text-xs">
          <Icon icon={showForm ? "solar:close-circle-bold-duotone" : "solar:add-circle-bold-duotone"} className="h-3.5 w-3.5" />
          {showForm ? "Cancel" : "Add Service"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9" required /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9" required /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-9" required /></div>
          <Button type="submit" size="sm" className="gap-1.5"><Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5" />Add Service</Button>
        </form>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Service</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Price</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                <Icon icon="solar:box-minimalistic-bold-duotone" className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs">No services yet. Add your first service.</p>
              </td></tr>
            ) : services.map((s) => (
              <tr key={s._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-foreground">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">{s.category}</span>
                </td>
                <td className="px-5 py-3 text-xs font-bold text-foreground">₹{s.price}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                    s.isActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon icon={s.isActive ? "solar:check-circle-bold-duotone" : "solar:close-circle-bold-duotone"} className="h-2.5 w-2.5" />
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => handleEdit(s)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-accent/10 text-accent transition-colors" title="Edit">
                      <Icon icon="solar:pen-new-square-bold-duotone" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => { if (!open) setEditingService(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Icon icon="solar:pen-new-square-bold-duotone" className="h-4 w-4 text-primary" /> Edit Service
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9" required /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9" required /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-9" required /></div>
            <Button type="submit" className="w-full h-9 gap-1.5 text-xs font-semibold"><Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5" />Update Service</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderServicesPage;
