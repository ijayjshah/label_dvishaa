import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageFileToCloudinary } from "@/lib/cloudinary-upload";
import { useToast } from "@/hooks/use-toast";

export type ImageFieldValue = { imageUrl: string; cloudinaryPublicId?: string };

type Props = {
  label?: string;
  value: ImageFieldValue;
  onChange: (v: ImageFieldValue) => void;
  disabled?: boolean;
  "data-testid"?: string;
};

export function ImageUrlWithCloudinaryUpload({
  label = "Image",
  value,
  onChange,
  disabled,
  "data-testid": tid,
}: Props) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const r = await uploadImageFileToCloudinary(file);
      onChange({ imageUrl: r.imageUrl, cloudinaryPublicId: r.cloudinaryPublicId });
      toast({ title: "Image uploaded to Cloudinary" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const busy = disabled || uploading;

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          value={value.imageUrl}
          onChange={e =>
            onChange({ imageUrl: e.target.value, cloudinaryPublicId: undefined })
          }
          placeholder="https://… or use Browse"
          disabled={busy}
          data-testid={tid ?? "input-image-url"}
          className="min-w-0 flex-1"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => onPick(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          data-testid="button-image-browse"
        >
          {uploading ? "Uploading…" : "Browse"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Browse uploads to Cloudinary; pasted URLs are stored as-is.
      </p>
      {value.imageUrl ? (
        <img
          src={value.imageUrl}
          alt=""
          className="mt-2 max-h-28 max-w-full rounded-md border border-border object-cover"
        />
      ) : null}
    </div>
  );
}
