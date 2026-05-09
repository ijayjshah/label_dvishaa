import { useState } from "react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListGallery, getListGalleryQueryKey, useUploadGallery } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload } from "lucide-react";

export default function GalleryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const { data, isLoading } = useListGallery({ approved: true, page: 1 });
  const items = data?.data ?? [];

  const uploadMutation = useUploadGallery({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
        toast({ title: "Photo submitted!", description: "It will appear after approval." });
        setUploadOpen(false);
        setImageUrl("");
        setCaption("");
      },
      onError: () => toast({ title: "Upload failed", variant: "destructive" }),
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) { toast({ title: "Please enter an image URL", variant: "destructive" }); return; }
    uploadMutation.mutate({ data: { imageUrl, caption: caption || undefined } });
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Our community</p>
            <h1 className="font-serif text-3xl sm:text-4xl">Lookbook</h1>
          </div>
          {user && (
            <Button
              onClick={() => setUploadOpen(true)}
              variant="outline"
              className="tracking-widest uppercase text-xs"
              data-testid="button-upload"
            >
              <Upload className="w-4 h-4 mr-2" /> Share Your Look
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3 aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-serif text-2xl mb-2">Gallery is empty</p>
            {user ? (
              <p className="text-sm">Be the first to share your look!</p>
            ) : (
              <p className="text-sm">Sign in to share your look</p>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid group relative overflow-hidden" data-testid={`img-gallery-${item.id}`}>
                <img src={item.imageUrl} alt={item.caption ?? "Gallery"} className="w-full object-cover" />
                {(item.caption || item.userName) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.caption && <p className="text-white text-sm line-clamp-2">{item.caption}</p>}
                    {item.userName && <p className="text-white/70 text-xs mt-0.5">{item.userName}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Share Your Look</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  data-testid="input-image-url"
                />
                <p className="text-xs text-muted-foreground">Paste a direct link to your photo</p>
              </div>
              <div className="space-y-1.5">
                <Label>Caption (optional)</Label>
                <Input
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Wearing Label Dvisha..."
                  data-testid="input-caption"
                />
              </div>
              <Button type="submit" className="w-full tracking-widest uppercase text-xs" disabled={uploadMutation.isPending} data-testid="button-submit-upload">
                {uploadMutation.isPending ? "Submitting..." : "Submit for Approval"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </StorefrontLayout>
  );
}
