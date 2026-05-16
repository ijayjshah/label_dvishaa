import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListCategories,
  getListCategoriesQueryKey,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUrlWithCloudinaryUpload } from "@/components/ImageUrlWithCloudinaryUpload";
import { Trash2, Pencil, Plus } from "lucide-react";

function emptyForm(parentId: number | null = null) {
  return {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    cloudinaryPublicId: undefined as string | undefined,
    isActive: true,
    parentId: parentId as number | null,
  };
}

export default function AdminCategories() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm());

  const { data: categories, isLoading } = useListCategories();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const createMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        invalidate();
        setFormOpen(false);
        toast({ title: "Category saved" });
      },
      onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }),
    },
  });
  const updateMutation = useUpdateCategory({
    mutation: {
      onSuccess: () => {
        invalidate();
        setFormOpen(false);
        setEditCat(null);
        toast({ title: "Category updated" });
      },
      onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }),
    },
  });
  const deleteMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Category deleted" });
      },
      onError: (e: any) =>
        toast({ title: e?.data?.error ?? "Cannot delete (check products or subcategories)", variant: "destructive" }),
    },
  });

  const roots = useMemo(
    () => (categories ?? []).filter((c) => c.parentId == null).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const subsByParent = useMemo(() => {
    const m = new Map<number, Category[]>();
    for (const c of categories ?? []) {
      if (c.parentId == null) continue;
      const list = m.get(c.parentId) ?? [];
      list.push(c);
      m.set(c.parentId, list);
    }
    for (const [, list] of m) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return m;
  }, [categories]);

  function openCreateRoot() {
    setEditCat(null);
    setForm(emptyForm(null));
    setFormOpen(true);
  }
  function openCreateSub(parentId: number) {
    setEditCat(null);
    setForm(emptyForm(parentId));
    setFormOpen(true);
  }
  function openEdit(cat: Category) {
    setEditCat(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? "",
      cloudinaryPublicId: cat.cloudinaryPublicId ?? undefined,
      isActive: cat.isActive,
      parentId: cat.parentId ?? null,
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      cloudinaryPublicId: form.cloudinaryPublicId || undefined,
      parentId: form.parentId ?? undefined,
    };
    if (editCat) updateMutation.mutate({ id: editCat.id, data });
    else createMutation.mutate({ data });
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const rootOptions = roots.filter((r) => !editCat || r.id !== editCat.id);

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-end mb-5">
        <Button onClick={openCreateRoot} className="tracking-widest uppercase text-xs" data-testid="button-create-category">
          <Plus className="w-4 h-4 mr-1" /> Add top-level category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background border border-border h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {roots.map((root) => (
            <div key={root.id} className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 border-b border-border/60 bg-muted/20">
                {root.imageUrl && <img src={root.imageUrl} alt="" className="w-10 h-10 object-cover flex-shrink-0 rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{root.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {root.slug} · {root.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openCreateSub(root.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Sub
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(root)} data-testid={`button-edit-${root.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete "${root.name}" and its structure?`)) deleteMutation.mutate({ id: root.id });
                    }}
                    className="text-destructive"
                    data-testid={`button-delete-${root.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ul className="divide-y divide-border/60">
                {(subsByParent.get(root.id) ?? []).map((sub) => (
                  <li key={sub.id} className="flex items-center gap-4 px-5 py-3 pl-10" data-testid={`row-category-${sub.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.slug} · {sub.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete "${sub.name}"?`)) deleteMutation.mutate({ id: sub.id });
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
                {(subsByParent.get(root.id) ?? []).length === 0 && (
                  <li className="px-5 py-4 text-xs text-muted-foreground pl-10">No subcategories yet.</li>
                )}
              </ul>
            </div>
          ))}
          {roots.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">No categories yet. Add a top-level category to get started.</p>
          )}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editCat ? "Edit category" : form.parentId ? "Add subcategory" : "Add top-level category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {!editCat && (
              <div className="space-y-1.5">
                <Label>Under collection</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={form.parentId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      parentId: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  disabled={Boolean(editCat)}
                >
                  <option value="">None (top-level)</option>
                  {rootOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">Products should be assigned to a subcategory when possible.</p>
              </div>
            )}
            {editCat && (
              <div className="space-y-1.5">
                <Label>Parent</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={form.parentId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      parentId: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                >
                  <option value="">None (top-level)</option>
                  {rootOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required data-testid="input-name" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto from name if empty"
                data-testid="input-slug"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} data-testid="input-description" />
            </div>
            <ImageUrlWithCloudinaryUpload
              label="Category image"
              value={{ imageUrl: form.imageUrl, cloudinaryPublicId: form.cloudinaryPublicId }}
              onChange={(v) => setForm((f) => ({ ...f, imageUrl: v.imageUrl, cloudinaryPublicId: v.cloudinaryPublicId }))}
              disabled={isPending}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} data-testid="checkbox-active" />
              Active
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 tracking-widest uppercase text-xs" disabled={isPending} data-testid="button-submit">
                {isPending ? "Saving..." : editCat ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
