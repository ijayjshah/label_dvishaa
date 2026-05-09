import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import {
  useGetProduct, getGetProductQueryKey,
  useAddToCart, getGetCartQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CustomMeasurements { bust?: string; waist?: string; hip?: string; height?: string }

export default function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [customSize, setCustomSize] = useState(false);
  const [measurements, setMeasurements] = useState<CustomMeasurements>({});
  const [quantity, setQuantity] = useState(1);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart", description: product?.name });
      },
      onError: () => {
        toast({ title: "Failed to add to cart", variant: "destructive" });
      },
    },
  });

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
              <div className="h-5 bg-muted rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="text-center py-24 text-muted-foreground">
          <p className="font-serif text-2xl">Product not found</p>
        </div>
      </StorefrontLayout>
    );
  }

  const images = product.images ?? [];
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const sections = product.sections ?? [];
  const reviews = (product as any).reviews ?? [];

  const currentImage = images[selectedImageIndex]?.imageUrl ?? images[0]?.imageUrl;

  function toggleSection(id: number) {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAddToCart() {
    if (!product) return;
    if (!customSize && sizes.length > 0 && !selectedSizeId) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    addToCart.mutate({
      data: {
        productId: product.id,
        colorId: selectedColorId ?? undefined,
        productSizeId: !customSize ? (selectedSizeId ?? undefined) : undefined,
        customMeasurements: customSize ? measurements : undefined,
        quantity,
      },
    });
  }

  const avgRating = reviews.length > 0 ? Math.round(reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) : null;

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <button onClick={() => setLocation("/products")} className="hover:text-foreground transition-colors">Collections</button>
          <span>/</span>
          {product.category && (
            <>
              <button onClick={() => setLocation(`/products?categoryId=${product.categoryId}`)} className="hover:text-foreground transition-colors">{product.category.name}</button>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">No image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 8).map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${i === selectedImageIndex ? "border-primary" : "border-transparent"}`}
                    data-testid={`button-image-${i}`}
                  >
                    <img src={img.imageUrl} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">{product.category.name}</p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5">
              <p className="text-2xl text-foreground font-medium">₹{product.price.toLocaleString("en-IN")}</p>
              {product.compareAtPrice && (
                <p className="text-lg text-muted-foreground line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</p>
              )}
            </div>

            {avgRating && (
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < avgRating ? "text-primary" : "text-muted"}>★</span>
                ))}
                <span className="text-xs text-muted-foreground ml-1">({reviews.length})</span>
              </div>
            )}

            {product.shortDescription && (
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
                  Colour{selectedColorId ? `: ${colors.find(c => c.id === selectedColorId)?.name}` : ""}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColorId(color.id === selectedColorId ? null : color.id)}
                      disabled={!color.isAvailable}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color.id === selectedColorId ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground"
                      } ${!color.isAvailable ? "opacity-30 cursor-not-allowed" : ""}`}
                      style={{ backgroundColor: color.hexCode }}
                      data-testid={`button-color-${color.id}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {(sizes.length > 0 || product.allowCustomSize) && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground">Size</p>
                  <button className="text-xs text-muted-foreground underline underline-offset-4">Size Guide</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSizeId(s.id === selectedSizeId ? null : s.id); setCustomSize(false); }}
                      disabled={!s.isAvailable}
                      className={`px-4 py-2 text-sm border transition-colors ${
                        s.id === selectedSizeId && !customSize ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                      } ${!s.isAvailable ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      data-testid={`button-size-${s.id}`}
                    >
                      {(s as any).size?.label ?? s.sizeId}
                    </button>
                  ))}
                  {product.allowCustomSize && (
                    <button
                      onClick={() => { setCustomSize(!customSize); setSelectedSizeId(null); }}
                      className={`px-4 py-2 text-sm border transition-colors ${
                        customSize ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                      }`}
                      data-testid="button-custom-size"
                    >
                      Custom Size
                    </button>
                  )}
                </div>

                {/* Custom size inputs */}
                {customSize && (
                  <div className="mt-4 grid grid-cols-2 gap-3 p-4 border border-border">
                    <p className="col-span-2 text-xs tracking-widest uppercase text-muted-foreground">Enter your measurements (in inches)</p>
                    {[
                      { key: "bust", label: "Bust" },
                      { key: "waist", label: "Waist" },
                      { key: "hip", label: "Hip" },
                      { key: "height", label: "Height" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                        <Input
                          placeholder="e.g. 36"
                          value={measurements[key as keyof CustomMeasurements] ?? ""}
                          onChange={e => setMeasurements(prev => ({ ...prev, [key]: e.target.value || undefined }))}
                          className="text-sm"
                          data-testid={`input-${key}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-xs tracking-widest uppercase text-muted-foreground">Qty</p>
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                  data-testid="button-qty-decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-4 py-2 text-sm" data-testid="text-quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                  data-testid="button-qty-increase"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              size="lg"
              className="w-full tracking-widest uppercase text-xs mb-3"
              data-testid="button-add-to-cart"
            >
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>

            {product.deliveryDays && (
              <p className="text-xs text-center text-muted-foreground">
                Delivery in {product.deliveryDays} days
              </p>
            )}

            {/* Accordion sections */}
            {sections.length > 0 && (
              <div className="mt-8 border-t border-border">
                {sections.map(section => (
                  <div key={section.id} className="border-b border-border">
                    <button
                      className="w-full flex items-center justify-between py-4 text-sm font-medium text-left"
                      onClick={() => toggleSection(section.id)}
                      data-testid={`button-section-${section.id}`}
                    >
                      {section.title}
                      {openSections[section.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openSections[section.id] && (
                      <div className="pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="font-serif text-2xl mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reviews.map((r: any) => (
                <div key={r.id} className="p-5 border border-border" data-testid={`card-review-${r.id}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? "text-primary text-sm" : "text-muted text-sm"}>★</span>
                      ))}
                    </div>
                    <p className="text-sm font-medium">{r.userName}</p>
                  </div>
                  {r.title && <p className="text-sm font-medium mb-1">{r.title}</p>}
                  {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
