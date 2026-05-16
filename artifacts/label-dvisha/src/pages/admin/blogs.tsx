import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListBlogPosts,
  getListBlogPostsQueryKey,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUrlWithCloudinaryUpload } from "@/components/ImageUrlWithCloudinaryUpload";
import { Pencil, Plus, Trash2 } from "lucide-react";

function emptyPost() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    imageUrl: "",
    cloudinaryPublicId: undefined as string | undefined,
    isPublished: false,
    sortOrder: 0,
  };
}

export default function AdminBlogs() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyPost());

  const { data, isLoading } = useListBlogPosts(
    { page: 1, limit: 100 },
    { query: { queryKey: getListBlogPostsQueryKey({ page: 1, limit: 100 }) } },
  );
  const posts = data?.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });

  const createMutation = useCreateBlogPost({
    mutation: {
      onSuccess: () => {
        invalidate();
        setDialogOpen(false);
        toast({ title: "Post created" });
      },
      onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }),
    },
  });
  const updateMutation = useUpdateBlogPost({
    mutation: {
      onSuccess: () => {
        invalidate();
        setDialogOpen(false);
        setEditId(null);
        toast({ title: "Post updated" });
      },
      onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }),
    },
  });
  const deleteMutation = useDeleteBlogPost({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Post deleted" });
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
  });

  function openCreate() {
    setEditId(null);
    setForm(emptyPost());
    setDialogOpen(true);
  }

  function openEdit(p: (typeof posts)[0]) {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      body: p.body,
      imageUrl: p.featuredImageUrl ?? "",
      cloudinaryPublicId: p.featuredImageCloudinaryPublicId ?? undefined,
      isPublished: p.isPublished,
      sortOrder: p.sortOrder,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || undefined,
      body: form.body,
      featuredImageUrl: form.imageUrl.trim() || undefined,
      featuredImageCloudinaryPublicId: form.cloudinaryPublicId || undefined,
      isPublished: form.isPublished,
      sortOrder: form.sortOrder,
    };
    if (editId != null) updateMutation.mutate({ id: editId, data: payload });
    else createMutation.mutate({ data: payload });
  }

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Blog posts">
      <div className="flex justify-end mb-5">
        <Button onClick={openCreate} className="tracking-widest uppercase text-xs">
          <Plus className="w-4 h-4 mr-1" /> New post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : (
        <div className="bg-background border border-border divide-y divide-border rounded-lg overflow-hidden">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.slug} · {p.isPublished ? "Published" : "Draft"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => {
                  if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate({ id: p.id });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {posts.length === 0 && <p className="p-8 text-sm text-muted-foreground text-center">No posts yet.</p>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editId ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="from title if empty" />
            </div>
            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <ImageUrlWithCloudinaryUpload
              label="Featured image"
              value={{ imageUrl: form.imageUrl, cloudinaryPublicId: form.cloudinaryPublicId }}
              onChange={(v) => setForm((f) => ({ ...f, imageUrl: v.imageUrl, cloudinaryPublicId: v.cloudinaryPublicId }))}
              disabled={pending}
            />
            <div className="space-y-1.5">
              <Label>Body *</Label>
              <textarea
                required
                rows={12}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y font-sans"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-7">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                />
                Published
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={pending}>
                {pending ? "Saving…" : editId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
