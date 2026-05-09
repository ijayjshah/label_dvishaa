import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListCategories, getListCategoriesQueryKey,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Pencil, Plus } from "lucide-react";

function emptyForm() {
  return { name: "", slug: "", description: "", imageUrl: "", isActive: true };
}

export default function AdminCategories() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [form, setForm] = useState(emptyForm());

  const { data: categories, isLoading } = useListCategories();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const createMutation = useCreateCategory({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); toast({ title: "Category created" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const updateMutation = useUpdateCategory({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); setEditCat(null); toast({ title: "Category updated" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const deleteMutation = useDeleteCategory({
    mutation: { onSuccess: () => { invalidate(); toast({ title: "Category deleted" }); }, onError: () => toast({ title: "Cannot delete category with products", variant: "destructive" }) },
  });

  function openCreate() { setEditCat(null); setForm(emptyForm()); setFormOpen(true); }
  function openEdit(cat: any) {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "", imageUrl: cat.imageUrl ?? "", isActive: cat.isActive });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
    if (editCat) updateMutation.mutate({ id: editCat.id, data });
    else createMutation.mutate({ data });
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-end mb-5">
        <Button onClick={openCreate} className="tracking-widest uppercase text-xs" data-testid="button-create-category">
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-background border border-border h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-background border border-border divide-y divide-border">
          {(categories ?? []).map(cat => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-category-${cat.id}`}>
              {cat.imageUrl && (
                <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.slug} · {cat.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} data-testid={`button-edit-${cat.id}`}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate({ id: cat.id }); }} className="text-destructive" data-testid={`button-delete-${cat.id}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required data-testid="input-name" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} data-testid="input-description" />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." data-testid="input-image-url" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} data-testid="checkbox-active" />
              Active
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 tracking-widest uppercase text-xs" disabled={isPending} data-testid="button-submit">
                {isPending ? "Saving..." : (editCat ? "Update" : "Create")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
