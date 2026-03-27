import { useState } from "react";
import { reviewApi } from "@/api/reviewApi";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface Review {
  _id: string;
  user?: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
  isFlagged?: boolean;
}

const AdminReviewsPage = () => {
  const [providerId, setProviderId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!providerId) { toast({ title: "Enter a Provider ID", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await reviewApi.getProviderReviews(providerId);
      setReviews(res.data.reviews || res.data || []);
    } catch {
      toast({ title: "Failed to load reviews", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleFlag = async (id: string) => {
    try {
      await reviewApi.flag(id);
      toast({ title: "Review flagged as fake" });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, isFlagged: true } : r));
    } catch {
      toast({ title: "Failed to flag", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await reviewApi.delete(id);
      toast({ title: "Review deleted" });
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">Review Management</h1>
        <p className="text-xs text-muted-foreground">View provider reviews and flag fake ones</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={providerId} onChange={(e) => setProviderId(e.target.value)} placeholder="Enter Provider ID" className="pl-10 h-9 text-xs" />
        </div>
        <Button onClick={fetchReviews} size="sm" className="gap-1.5 h-9 text-xs">
          <Icon icon="solar:magnifer-bold-duotone" className="h-3.5 w-3.5" /> Load Reviews
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-hidden premium-shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reviewer</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rating</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Comment</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-xs">
                  <Icon icon="solar:star-shine-bold-duotone" className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p>Enter a provider ID above to view reviews</p>
                </td></tr>
              ) : reviews.map(r => (
                <tr key={r._id} className={`hover:bg-secondary/30 transition-colors ${r.isFlagged ? "bg-destructive/5" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {r.user?.name?.charAt(0) || "A"}
                      </div>
                      <span className="text-xs font-semibold text-foreground">{r.user?.name || "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon key={i} icon="solar:star-bold" className={`h-3 w-3 ${i < r.rating ? "text-accent" : "text-border"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground max-w-xs truncate">{r.comment}</td>
                  <td className="px-5 py-3 text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {!r.isFlagged && (
                        <button onClick={() => handleFlag(r._id)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-warning/10 text-warning transition-colors" title="Flag as fake">
                          <Icon icon="solar:flag-bold-duotone" className="h-4 w-4" />
                        </button>
                      )}
                      {r.isFlagged && (
                        <span className="text-[10px] font-bold text-destructive mr-1">FLAGGED</span>
                      )}
                      <button onClick={() => handleDelete(r._id)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
