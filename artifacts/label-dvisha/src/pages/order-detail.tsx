import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const orderId = Number(id);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!order) {
    return (
      <StorefrontLayout>
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-2xl">Order not found</p>
        </div>
      </StorefrontLayout>
    );
  }

  const addr = order.shippingAddress as any;

  return (
    <StorefrontLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => setLocation("/orders")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </button>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">Order #{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-muted"}`} data-testid="text-order-status">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Items */}
        <div className="border border-border p-5 mb-6">
          <h2 className="font-serif text-lg mb-4">Items</h2>
          <div className="space-y-4">
            {((order as any).items ?? []).map((item: any) => (
              <div key={item.id} className="flex gap-4" data-testid={`card-order-item-${item.id}`}>
                <div className="w-16 h-20 bg-muted flex-shrink-0 overflow-hidden">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  {item.selectedColor && <p className="text-xs text-muted-foreground">Colour: {item.selectedColor}</p>}
                  {item.selectedSize && <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">₹{item.totalPrice.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Shipping address */}
          <div className="border border-border p-5">
            <h2 className="font-serif text-lg mb-3">Shipping Address</h2>
            {addr && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">{addr.name}</p>
                <p>{addr.address1}</p>
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                <p>{addr.phone}</p>
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="border border-border p-5">
            <h2 className="font-serif text-lg mb-3">Payment</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{(order.shippingCost ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted-foreground">Payment status</span>
                <span className={order.paymentStatus === "paid" ? "text-green-700" : "text-yellow-700"}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
