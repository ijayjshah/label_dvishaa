import { Link } from "wouter";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import {
  useGetCart, getGetCartQueryKey,
  useUpdateCartItem, useRemoveCartItem, useClearCart,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function CartPage() {
  const { data: cart, isLoading } = useGetCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });

  const removeItem = useRemoveCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Removed from cart" });
      },
    },
  });

  const clearCart = useClearCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });

  const items = cart?.items ?? [];

  return (
    <StorefrontLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl">Your Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">{cart?.itemCount ?? 0} items</p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => clearCart.mutate()}
              disabled={clearCart.isPending}
              data-testid="button-clear-cart"
            >
              Clear all
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-24 h-32 bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">Discover beautiful pieces from our collections</p>
            <Button asChild className="tracking-widest uppercase text-xs">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4" data-testid={`card-cart-item-${item.id}`}>
                  <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                    <div className="w-24 h-32 bg-muted overflow-hidden">
                      {item.product?.primaryImage ? (
                        <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium line-clamp-2" data-testid={`text-item-name-${item.id}`}>
                          {item.product?.name}
                        </p>
                        {item.colorName && <p className="text-xs text-muted-foreground mt-0.5">Colour: {item.colorName}</p>}
                        {item.sizeLabel && <p className="text-xs text-muted-foreground">Size: {item.sizeLabel}</p>}
                        {item.customMeasurements && <p className="text-xs text-muted-foreground">Custom size</p>}
                      </div>
                      <button
                        onClick={() => removeItem.mutate({ itemId: item.id })}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button
                          className="px-2 py-1 hover:bg-muted transition-colors"
                          onClick={() => updateItem.mutate({ itemId: item.id, data: { quantity: Math.max(1, item.quantity - 1) } })}
                          data-testid={`button-qty-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-sm" data-testid={`text-qty-${item.id}`}>{item.quantity}</span>
                        <button
                          className="px-2 py-1 hover:bg-muted transition-colors"
                          onClick={() => updateItem.mutate({ itemId: item.id, data: { quantity: item.quantity + 1 } })}
                          data-testid={`button-qty-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium" data-testid={`text-item-total-${item.id}`}>
                        ₹{((item.product?.price ?? 0) * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="border border-border p-6 sticky top-20">
                <h2 className="font-serif text-xl mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({cart?.itemCount} items)</span>
                    <span data-testid="text-subtotal">₹{(cart?.subtotal ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-700">Free</span>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mb-5">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span data-testid="text-total">₹{(cart?.subtotal ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <Button asChild className="w-full tracking-widest uppercase text-xs" data-testid="button-checkout">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full mt-2 text-xs text-muted-foreground">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
