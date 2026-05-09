import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListProducts, getListProductsQueryKey,
  useListCategories,
  useCreateProduct, useUpdateProduct, useDeleteProduct,
  useAddProductColor, useDeleteProductColor,
  useAddProductImage, useDeleteProductImage,
  useAddProductSection, useUpdateProductSection, useDeleteProductSection,
  useAddProductSize, useUpdateProductSize, useDeleteProductSize,
  useListSizes,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, ChevronDown, ChevronRight, Pencil } from "lucide-react";

function emptyProduct() {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: 0,
    compareAtPrice: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    sku: "",
    allowCustomSize: false,
    isFeatured: false,
    isActive: true,
    deliveryDays: "7" as string,
  };
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyProduct());
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading } = useListProducts({ search: search || undefined, limit: 50 });
  const { data: categories } = useListCategories();
  const { data: allSizes } = useListSizes();

  const products = productsData?.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const createMutation = useCreateProduct({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); toast({ title: "Product created" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const updateMutation = useUpdateProduct({
    mutation: { onSuccess: () => { invalidate(); setFormOpen(false); setEditProduct(null); toast({ title: "Product updated" }); }, onError: (e: any) => toast({ title: e?.data?.error ?? "Failed", variant: "destructive" }) },
  });
  const deleteMutation = useDeleteProduct({
    mutation: { onSuccess: () => { invalidate(); toast({ title: "Product deleted" }); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) },
  });

  function openCreate() {
    setEditProduct(null);
    setForm(emptyProduct());
    setFormOpen(true);
  }
  function openEdit(p: any) {
    setEditProduct(p);
    setForm({
      name: p.name, slug: p.slug, shortDescription: p.shortDescription ?? "", description: p.description ?? "",
      price: p.price, compareAtPrice: p.compareAtPrice ?? undefined, categoryId: p.categoryId ?? undefined, sku: p.sku ?? "",
      allowCustomSize: p.allowCustomSize ?? false, isFeatured: p.isFeatured, isActive: p.isActive, deliveryDays: p.deliveryDays ?? "7",
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
    if (editProduct) updateMutation.mutate({ id: editProduct.id, data });
    else createMutation.mutate({ data });
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="text-sm" data-testid="input-search" />
        </div>
        <Button onClick={openCreate} className="tracking-widest uppercase text-xs flex-shrink-0" data-testid="button-create-product">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-background border border-border p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-xl mb-2">No products yet</p>
          <Button onClick={openCreate} variant="outline" className="mt-2 text-xs tracking-widest uppercase">Add First Product</Button>
        </div>
      ) : (
        <div className="bg-background border border-border divide-y divide-border">
          {products.map(product => (
            <ProductRow
              key={product.id}
              product={product}
              expanded={expandedId === product.id}
              onToggle={() => setExpandedId(expandedId === product.id ? null : product.id)}
              onEdit={() => openEdit(product)}
              onDelete={() => {
                if (confirm(`Delete "${product.name}"?`)) deleteMutation.mutate({ id: product.id });
              }}
              allSizes={allSizes ?? []}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required data-testid="input-name" />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required data-testid="input-price" />
              </div>
              <div className="space-y-1.5">
                <Label>Compare at Price (₹)</Label>
                <Input type="number" value={form.compareAtPrice ?? ""} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value ? Number(e.target.value) : undefined }))} data-testid="input-compare-price" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={form.categoryId ?? ""}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                  data-testid="select-category"
                >
                  <option value="">Select category</option>
                  {(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} data-testid="input-sku" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Short Description</Label>
                <Input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} data-testid="input-short-desc" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Description</Label>
                <textarea
                  rows={3}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  data-testid="textarea-description"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Delivery Days</Label>
                <Input value={form.deliveryDays} onChange={e => setForm(f => ({ ...f, deliveryDays: e.target.value }))} placeholder="e.g. 7-10" data-testid="input-delivery-days" />
              </div>
              <div className="space-y-1.5">
                <Label>&nbsp;</Label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} data-testid="checkbox-featured" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.allowCustomSize} onChange={e => setForm(f => ({ ...f, allowCustomSize: e.target.checked }))} data-testid="checkbox-custom-size" />
                    Custom Size
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} data-testid="checkbox-active" />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 tracking-widest uppercase text-xs" disabled={isPending} data-testid="button-submit">
                {isPending ? "Saving..." : (editProduct ? "Update Product" : "Create Product")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function ProductRow({ product, expanded, onToggle, onEdit, onDelete, allSizes }: any) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const addColor = useAddProductColor({ mutation: { onSuccess: invalidate, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const deleteColor = useDeleteProductColor({ mutation: { onSuccess: invalidate, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const addImage = useAddProductImage({ mutation: { onSuccess: invalidate, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const deleteImage = useDeleteProductImage({ mutation: { onSuccess: invalidate, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const addSize = useAddProductSize({ mutation: { onSuccess: invalidate, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const deleteSize = useDeleteProductSize({ mutation: { onSuccess: invalidate, onError: () => toast({ title: "Failed", variant: "destructive" }) } });

  const [colorForm, setColorForm] = useState({ name: "", hexCode: "#000000" });
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

  return (
    <div data-testid={`row-product-${product.id}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {product.primaryImage && (
          <img src={product.primaryImage} alt={product.name} className="w-10 h-12 object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
          <p className="text-xs text-muted-foreground">₹{product.price.toLocaleString("en-IN")} · {product.isActive ? "Active" : "Draft"}{product.isFeatured ? " · Featured" : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`button-edit-${product.id}`}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive" data-testid={`button-delete-${product.id}`}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 bg-muted/30 border-t border-border space-y-5 pt-4">
          {/* Images */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Images</p>
            <div className="flex gap-2 flex-wrap mb-2">
              {(product.images ?? []).map((img: any) => (
                <div key={img.id} className="relative group">
                  <img src={img.imageUrl} alt="" className="w-16 h-20 object-cover" />
                  <button
                    onClick={() => deleteImage.mutate({ id: product.id, imageId: img.id })}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL..." className="text-xs" data-testid="input-image-url" />
              <Button
                size="sm" variant="outline" className="text-xs"
                onClick={() => {
                  if (imageUrl) {
                    addImage.mutate({ id: product.id, data: { imageUrl, isPrimary: (product.images ?? []).length === 0, sortOrder: (product.images ?? []).length } });
                    setImageUrl("");
                  }
                }}
                data-testid="button-add-image"
              >Add</Button>
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Colours</p>
            <div className="flex gap-2 flex-wrap mb-2">
              {(product.colors ?? []).map((c: any) => (
                <div key={c.id} className="flex items-center gap-1.5 text-xs border border-border px-2 py-1">
                  <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.hexCode }} />
                  {c.name}
                  <button onClick={() => deleteColor.mutate({ id: product.id, colorId: c.id })} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={colorForm.name} onChange={e => setColorForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="text-xs" data-testid="input-color-name" />
              <input type="color" value={colorForm.hexCode} onChange={e => setColorForm(f => ({ ...f, hexCode: e.target.value }))} className="h-9 w-10 border border-input rounded-md cursor-pointer" />
              <Button
                size="sm" variant="outline" className="text-xs"
                onClick={() => {
                  if (colorForm.name) {
                    addColor.mutate({ id: product.id, data: { name: colorForm.name, hexCode: colorForm.hexCode } });
                    setColorForm({ name: "", hexCode: "#000000" });
                  }
                }}
                data-testid="button-add-color"
              >Add</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Sizes</p>
            <div className="flex gap-2 flex-wrap mb-2">
              {(product.sizes ?? []).map((s: any) => (
                <div key={s.id} className="flex items-center gap-1.5 text-xs border border-border px-2 py-1">
                  {s.size?.label ?? s.sizeId}
                  <button onClick={() => deleteSize.mutate({ id: product.id, productSizeId: s.id })} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                className="border border-input rounded-md px-2 py-1.5 text-xs bg-background"
                value={selectedSizeId ?? ""}
                onChange={e => setSelectedSizeId(e.target.value ? Number(e.target.value) : null)}
                data-testid="select-size"
              >
                <option value="">Select size...</option>
                {allSizes.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <Button
                size="sm" variant="outline" className="text-xs"
                onClick={() => {
                  if (selectedSizeId) {
                    addSize.mutate({ id: product.id, data: { sizeId: selectedSizeId, stockQuantity: 999 } });
                    setSelectedSizeId(null);
                  }
                }}
                data-testid="button-add-size"
              >Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
