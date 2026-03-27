import { useEffect, useState } from "react";
import { providerApi } from "@/api/providerApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

type DocumentType = "Aadhaar" | "PAN" | "License";

interface ProviderDocument {
  type: DocumentType;
  file: File;
}

const UploadDocumentsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [kycStatus, setKycStatus] = useState<"none" | "pending" | "rejected" | "approved">("none");

  const loadStatus = async () => {
    try {
      const res = await providerApi.getMyProviderProfile();
      if (!res.data.success) return;
      const profile = res.data.profile;
      if (!profile) {
        toast({ title: "Apply as provider first", variant: "destructive" });
        navigate("/profile");
        return;
      }
      setKycStatus(profile.documentStatus || "none");
    } catch {}
  };

  useEffect(() => { loadStatus(); }, []);

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocuments((prev) => [...prev.filter((doc) => doc.type !== type), { type, file }]);
  };

  const handleUpload = async () => {
    if (documents.length === 0) {
      toast({ title: "No documents selected", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = [];
      for (const doc of documents) {
        const base64 = await convertToBase64(doc.file);
        payload.push({ type: doc.type, base64 });
      }
      await providerApi.uploadDocuments({ documents: payload });
      toast({ title: "Documents uploaded", description: "Please wait while we verify your KYC" });
      setKycStatus("pending");
      setDocuments([]);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setLoading(false);
  };

  if (kycStatus === "pending") {
    return (
      <div className="max-w-xl mx-auto text-center p-8 rounded-2xl bg-card border border-border">
        <Icon icon="solar:clock-circle-bold-duotone" className="h-12 w-12 mx-auto mb-3 text-warning" />
        <h2 className="text-xl font-bold text-foreground font-display mb-2">KYC Under Review</h2>
        <p className="text-sm text-muted-foreground">Your documents have been submitted. Please wait while our team verifies them.</p>
      </div>
    );
  }

  if (kycStatus === "approved") {
    return (
      <div className="max-w-xl mx-auto text-center p-8 rounded-2xl bg-card border border-border">
        <Icon icon="solar:verified-check-bold-duotone" className="h-12 w-12 mx-auto mb-3 text-accent" />
        <h2 className="text-xl font-bold text-foreground font-display mb-2">Provider Verified</h2>
        <p className="text-sm text-muted-foreground mb-4">You can now access the provider dashboard.</p>
        <Button onClick={() => navigate("/dashboard")} className="gap-1.5">
          <Icon icon="solar:home-smile-angle-bold-duotone" className="h-4 w-4" /> Go to Dashboard
        </Button>
      </div>
    );
  }

  if (kycStatus === "rejected") {
    return (
      <div className="max-w-xl mx-auto text-center p-8 rounded-2xl bg-card border border-border">
        <Icon icon="solar:danger-triangle-bold-duotone" className="h-12 w-12 mx-auto mb-3 text-destructive" />
        <h2 className="text-xl font-bold text-foreground font-display mb-2">Documents Rejected</h2>
        <p className="text-sm text-muted-foreground mb-4">Please upload valid documents again.</p>
        <Button onClick={() => setKycStatus("none")} className="gap-1.5">
          <Icon icon="solar:upload-bold-duotone" className="h-4 w-4" /> Re-upload Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-display">Upload Verification Documents</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload the required documents to verify your provider account.</p>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
        {(["Aadhaar", "PAN", "License"] as DocumentType[]).map((type) => (
          <div key={type} className="space-y-1.5">
            <Label className="text-xs font-semibold">{type === "License" ? "License / Certificate" : `${type} Card`}</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleFile(e, type)} className="h-9" />
          </div>
        ))}
      </div>

      {documents.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Selected: {documents.map((d) => d.type).join(", ")}
        </div>
      )}

      <Button className="w-full gap-1.5" onClick={handleUpload} disabled={loading}>
        <Icon icon={loading ? "svg-spinners:ring-resize" : "solar:upload-bold-duotone"} className="h-4 w-4" />
        {loading ? "Uploading..." : "Submit Documents"}
      </Button>
    </div>
  );
};

export default UploadDocumentsPage;
