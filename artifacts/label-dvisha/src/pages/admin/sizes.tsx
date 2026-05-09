import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListSizes, getListSizesQueryKey,
  useCreateSize, useUpdateSize, useDeleteSize,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Pencil, Plus } from "lucide-react";

function emptyForm() {
  return { label: "", description: "", sortOrder: 0 };
}

export default function AdminSizes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editSize, setEditSize] = useState<any>(null);
  const [form, setForm] = useState(emptyForm());

  const { data: sizes, isLoading } = useListSizes();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListSizesQueryKey() });

  const createMutation = useCreateSize({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); toast({ title: "Size created" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const updateMutation = useUpdateSize({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); setEditSize(null); toast({ title: "Size updated" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const deleteMutation = useDeleteSize({
    mutation: { onSuccess: () => { invalidate(); toast({ title: "Size deleted" }); }, onError: () => toast({ title: "Cannot delete size in use", variant: "destructive" }) },
  });

  function openCreate() { setEditSize(null); setForm(emptyForm()); setFormOpen(true); }
  function openEdit(s: any) {
    setEditSize(s);
    setForm({ label: s.label, description: s.description ?? "", sortOrder: s.sortOrder ?? 0 });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editSize) updateMutation.mutate({ id: editSize.id, data: form });
    else createMutation.mutate({ data: form });
  }

  return (
    <AdminLayout title="Sizes">
      <div className="flex justify-end mb-5">
        <Button onClick={openCreate} className="tracking-widest uppercase text-xs" data-testid="button-create-size">
          <Plus className="w-4 h-4 mr-1" /> Add Size
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-background border border-border h-20 animate-pulse" />)}
        </div>
      ) : (sizes ?? []).length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-xl">No sizes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(sizes ?? []).map((s: any) => (
            <div key={s.id} className="bg-background border border-border p-4 flex items-center justify-between" data-testid={`card-size-${s.id}`}>
              <div>
                <p className="text-lg font-serif">{s.label}</p>
                {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)} data-testid={`button-edit-${s.id}`}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete size "${s.label}"?`)) deleteMutation.mutate({ id: s.id }); }} className="text-destructive" data-testid={`button-delete-${s.id}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editSize ? "Edit Size" : "Add Size"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Label (e.g. XS, S, M, L, XL) *</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required data-testid="input-label" />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Bust 32-34, Waist 26-28..." data-testid="input-description" />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} data-testid="input-sort-order" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 tracking-widest uppercase text-xs" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editSize ? "Update" : "Create")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
