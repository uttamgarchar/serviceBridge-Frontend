import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Category { _id: string; name: string; description?: string; }

const AdminCategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res.data.categories || res.data || []);
    } catch {
      toast({ title: "Failed to load categories", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditId(null); setName(""); setDescription(""); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditId(c._id); setName(c.name); setDescription(c.description || ""); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editId) {
        await adminApi.updateCategory(editId, { name, description });
        toast({ title: "Category updated" });
      } else {
        await adminApi.addCategory({ name, description });
        toast({ title: "Category added" });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try { await adminApi.deleteCategory(id); toast({ title: "Deleted" }); fetchCategories(); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Service Categories</h2>
        <Button onClick={openAdd} size="sm" className="gap-2 text-xs">
          <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">#</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-xs">No categories found</td></tr>
            ) : categories.map((c, i) => (
              <tr key={c._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-xs text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-3 text-xs font-semibold text-foreground">{c.name}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{c.description || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => openEdit(c)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-info/10 text-info transition-colors" title="Edit">
                      <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Category Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Plumbing" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
            <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategoriesPage;
