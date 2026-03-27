import { useState } from "react";
import { reviewApi } from "@/api/reviewApi";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";

interface Review { _id: string; user?: { name: string }; rating: number; comment: string; createdAt: string; }

const ReviewsPage = () => {
  const [providerId, setProviderId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bookingId: "", rating: "5", comment: "" });
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!providerId) return;
    setLoading(true);
    try { const res = await reviewApi.getProviderReviews(providerId); setReviews(res.data.reviews || res.data || []); }
    catch { toast({ title: "Failed to load reviews", variant: "destructive" }); }
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewApi.add({ bookingId: form.bookingId, rating: Number(form.rating), comment: form.comment });
      toast({ title: "Review submitted" });
      setShowForm(false);
      setForm({ bookingId: "", rating: "5", comment: "" });
      if (providerId) fetchReviews();
    } catch { toast({ title: "Failed to submit review", variant: "destructive" }); }
  };

  const handleFlag = async (id: string) => {
    try { await reviewApi.flag(id); toast({ title: "Review flagged" }); }
    catch { toast({ title: "Failed to flag", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try { await reviewApi.delete(id); toast({ title: "Review deleted" }); setReviews(prev => prev.filter(r => r._id !== id)); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-display">Reviews</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" variant={showForm ? "outline" : "default"} className="gap-1.5 text-xs">
          <Icon icon={showForm ? "solar:close-circle-bold-duotone" : "solar:add-circle-bold-duotone"} className="h-3.5 w-3.5" />
          {showForm ? "Cancel" : "Write Review"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmitReview} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Booking ID</Label><Input value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} className="h-9" required /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="h-9" required /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Comment</Label><Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required /></div>
          <Button type="submit" size="sm" className="gap-1.5"><Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5" />Submit</Button>
        </form>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={providerId} onChange={(e) => setProviderId(e.target.value)} placeholder="Enter Provider ID to load reviews" className="pl-10 h-9" />
        </div>
        <Button onClick={fetchReviews} size="sm" className="gap-1.5">
          <Icon icon="solar:magnifer-bold-duotone" className="h-3.5 w-3.5" /> Load
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>
      ) : (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Reviewer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Rating</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Comment</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  <Icon icon="solar:star-shine-bold-duotone" className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs">Enter a provider ID to view reviews</p>
                </td></tr>
              ) : reviews.map((r) => (
                <tr key={r._id} className="hover:bg-secondary/30 transition-colors">
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
                      <button onClick={() => handleFlag(r._id)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-warning/10 text-warning transition-colors" title="Flag">
                        <Icon icon="solar:flag-bold-duotone" className="h-4 w-4" />
                      </button>
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

export default ReviewsPage;
