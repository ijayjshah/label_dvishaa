import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListBanners, getListBannersQueryKey,
  useCreateBanner, useUpdateBanner, useDeleteBanner,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUrlWithCloudinaryUpload } from "@/components/ImageUrlWithCloudinaryUpload";
import { Trash2, Pencil, Plus } from "lucide-react";

function emptyForm() {
  return {
    title: "",
    subtitle: "",
    imageUrl: "",
    cloudinaryPublicId: undefined as string | undefined,
    linkUrl: "",
    position: "hero",
    sortOrder: 0,
    isActive: true,
  };
}

export default function AdminBanners() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [form, setForm] = useState(emptyForm());

  const { data: banners, isLoading } = useListBanners();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBannersQueryKey() });

  const createMutation = useCreateBanner({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); toast({ title: "Banner created" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const updateMutation = useUpdateBanner({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); setEditBanner(null); toast({ title: "Banner updated" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const deleteMutation = useDeleteBanner({
    mutation: { onSuccess: () => { invalidate(); toast({ title: "Banner deleted" }); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) },
  });

  function openCreate() { setEditBanner(null); setForm(emptyForm()); setFormOpen(true); }
  function openEdit(b: any) {
    setEditBanner(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl ?? "",
      cloudinaryPublicId: b.cloudinaryPublicId ?? undefined,
      linkUrl: b.linkUrl ?? "",
      position: b.position ?? "hero",
      sortOrder: b.sortOrder ?? 0,
      isActive: b.isActive,
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      cloudinaryPublicId: form.cloudinaryPublicId || undefined,
    };
    if (editBanner) updateMutation.mutate({ id: editBanner.id, data: payload });
    else createMutation.mutate({ data: payload });
  }

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-end mb-5">
        <Button onClick={openCreate} className="tracking-widest uppercase text-xs" data-testid="button-create-banner">
          <Plus className="w-4 h-4 mr-1" /> Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-background border border-border h-24 animate-pulse" />)}
        </div>
      ) : (banners ?? []).length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-xl mb-2">No banners yet</p>
          <Button onClick={openCreate} variant="outline" className="text-xs tracking-widest uppercase mt-2">Add Banner</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(banners ?? []).map((b: any) => (
            <div key={b.id} className="bg-background border border-border flex gap-4 p-4" data-testid={`row-banner-${b.id}`}>
              {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-24 h-16 object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{b.title}</p>
                {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${b.isActive ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-muted-foreground">Order: {b.sortOrder}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(b)} data-testid={`button-edit-${b.id}`}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete banner?")) deleteMutation.mutate({ id: b.id }); }} className="text-destructive" data-testid={`button-delete-${b.id}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required data-testid="input-title" />
            </div>
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} data-testid="input-subtitle" />
            </div>
            <ImageUrlWithCloudinaryUpload
              label="Banner image"
              value={{ imageUrl: form.imageUrl, cloudinaryPublicId: form.cloudinaryPublicId }}
              onChange={v =>
                setForm(f => ({ ...f, imageUrl: v.imageUrl, cloudinaryPublicId: v.cloudinaryPublicId }))
              }
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            <div className="space-y-1.5">
              <Label>Link URL</Label>
              <Input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="/products" data-testid="input-link-url" />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} data-testid="input-sort-order" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} data-testid="checkbox-active" />
              Active
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 tracking-widest uppercase text-xs" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editBanner ? "Update" : "Create")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
