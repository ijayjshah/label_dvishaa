import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListGallery,
  getListGalleryQueryKey,
  useUploadGallery,
  useUpdateGallery,
  useDeleteGallery,
  type GalleryItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUrlWithCloudinaryUpload } from "@/components/ImageUrlWithCloudinaryUpload";
import { useAuth } from "@/hooks/use-auth";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function AdminGallery() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    id: number;
    imageUrl: string;
    cloudinaryPublicId?: string;
    caption: string;
  } | null>(null);

  const [newImage, setNewImage] = useState<{ imageUrl: string; cloudinaryPublicId?: string }>({
    imageUrl: "",
  });
  const [newCaption, setNewCaption] = useState("");

  const galleryQuery = useListGallery(
    { page: 1 },
    {
      query: {
        queryKey: getListGalleryQueryKey({ page: 1 }),
        enabled: Boolean(user && isAdmin && !authLoading),
        retry: 1,
      },
    },
  );
  const { data, isLoading, isError, error, refetch, isFetching } = galleryQuery;
  const items = data?.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: getListGalleryQueryKey() });

  const createMutation = useUploadGallery({
    mutation: {
      onSuccess: () => {
        invalidate();
        setCreateOpen(false);
        setNewImage({ imageUrl: "" });
        setNewCaption("");
        toast({ title: "Image added to gallery" });
      },
      onError: () => toast({ title: "Failed to add image", variant: "destructive" }),
    },
  });

  const updateMutation = useUpdateGallery({
    mutation: {
      onSuccess: () => {
        invalidate();
        setEditItem(null);
        toast({ title: "Gallery item updated" });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
  });

  const deleteMutation = useDeleteGallery({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Removed from gallery" });
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
  });

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newImage.imageUrl.trim()) {
      toast({ title: "Add an image", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      data: {
        imageUrl: newImage.imageUrl.trim(),
        cloudinaryPublicId: newImage.cloudinaryPublicId,
        caption: newCaption.trim() || undefined,
      },
    });
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem || !editItem.imageUrl.trim()) return;
    updateMutation.mutate({
      id: editItem.id,
      data: {
        imageUrl: editItem.imageUrl.trim(),
        cloudinaryPublicId: editItem.cloudinaryPublicId,
        caption: editItem.caption.trim() || null,
      },
    });
  }

  return (
    <AdminLayout title="Gallery">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground max-w-md">
          Manage lookbook images. Everything you add appears on the storefront gallery and home editorial section.
        </p>
        <Button
          onClick={() => {
            setNewImage({ imageUrl: "" });
            setNewCaption("");
            setCreateOpen(true);
          }}
          className="tracking-widest uppercase text-xs shrink-0"
          data-testid="button-add-gallery"
        >
          <Plus className="w-4 h-4 mr-1" /> Add image
        </Button>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center space-y-3">
          <p className="text-sm text-foreground font-medium">Could not load gallery</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error instanceof Error ? error.message : "Check that you are signed in as admin and the API is running."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : !data && (isLoading || isFetching) ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="font-serif text-xl mb-2">No gallery images yet</p>
          <Button variant="outline" className="mt-2 text-xs uppercase tracking-widest" onClick={() => setCreateOpen(true)}>
            Add your first image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item: GalleryItem) => (
            <div
              key={item.id}
              className="relative group overflow-hidden border border-border rounded-md bg-background"
              data-testid={`card-gallery-${item.id}`}
            >
              <img src={item.imageUrl} alt={item.caption ?? ""} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                {item.caption && (
                  <p className="text-white text-xs text-center line-clamp-2">{item.caption}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                    onClick={() =>
                      setEditItem({
                        id: item.id,
                        imageUrl: item.imageUrl,
                        cloudinaryPublicId: item.cloudinaryPublicId ?? undefined,
                        caption: item.caption ?? "",
                      })
                    }
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                    onClick={() => {
                      if (confirm("Remove this image from the gallery?")) {
                        deleteMutation.mutate({ id: item.id });
                      }
                    }}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add gallery image</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4 mt-2">
            <ImageUrlWithCloudinaryUpload
              label="Image"
              value={newImage}
              onChange={setNewImage}
              disabled={createMutation.isPending}
            />
            <div className="space-y-1.5">
              <Label>Caption (optional)</Label>
              <Input
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Short description…"
              />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving…" : "Save to gallery"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit gallery image</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={submitEdit} className="space-y-4 mt-2">
              <ImageUrlWithCloudinaryUpload
                label="Image"
                value={{
                  imageUrl: editItem.imageUrl,
                  cloudinaryPublicId: editItem.cloudinaryPublicId,
                }}
                onChange={(v) =>
                  setEditItem((prev) =>
                    prev ? { ...prev, imageUrl: v.imageUrl, cloudinaryPublicId: v.cloudinaryPublicId } : null,
                  )
                }
                disabled={updateMutation.isPending}
              />
              <div className="space-y-1.5">
                <Label>Caption</Label>
                <Input
                  value={editItem.caption}
                  onChange={(e) =>
                    setEditItem((prev) => (prev ? { ...prev, caption: e.target.value } : null))
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Update"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
