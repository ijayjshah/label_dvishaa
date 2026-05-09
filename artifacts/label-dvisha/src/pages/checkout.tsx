import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useGetCart, useCreateOrder, useVerifyPayment, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  street: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().length(6, "Enter a 6-digit pincode"),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

declare const Razorpay: any;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart } = useGetCart();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment({
    mutation: {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Order placed successfully!", description: `Order #${(order as any).orderNumber}` });
        setLocation(`/orders/${(order as any).id}`);
      },
    },
  });

  const items = cart?.items ?? [];

  function onSubmit(formData: CheckoutForm) {
    createOrder.mutate({
      data: {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India",
        },
        paymentMethod: "razorpay",
      },
    }, {
      onSuccess: (result: any) => {
        if (typeof Razorpay === "undefined") {
          toast({ title: "Dev mode: Payment simulated", description: "Order placed successfully" });
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setLocation(`/orders/${result.order.id}`);
          return;
        }

        const options = {
          key: result.razorpayKeyId,
          amount: result.amount,
          currency: result.currency,
          name: "Label Dvisha",
          description: `Order ${result.order.orderNumber}`,
          order_id: result.razorpayOrderId,
          handler: (response: any) => {
            verifyPayment.mutate({
              data: {
                orderId: result.order.id,
                razorpayOrderId: result.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
          },
          theme: { color: "#3D2B1F" },
        };
        const rzp = new Razorpay(options);
        rzp.open();
      },
    });
  }

  return (
    <StorefrontLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl sm:text-4xl mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping form */}
          <div>
            <h2 className="font-serif text-xl mb-5">Shipping Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" data-testid="input-name" {...register("fullName")} />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" data-testid="input-phone" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="street">Address</Label>
                <Input id="street" placeholder="House/flat no., Street" data-testid="input-address" {...register("street")} />
                {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" data-testid="input-city" {...register("city")} />
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" data-testid="input-state" {...register("state")} />
                  {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" maxLength={6} data-testid="input-pincode" {...register("pincode")} />
                {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-4 tracking-widest uppercase text-xs"
                disabled={createOrder.isPending || verifyPayment.isPending}
                data-testid="button-place-order"
              >
                {createOrder.isPending ? "Processing..." : "Place Order & Pay"}
              </Button>
            </form>
          </div>

          {/* Order summary */}
          <div>
            <h2 className="font-serif text-xl mb-5">Order Summary</h2>
            <div className="border border-border p-5">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 mb-4" data-testid={`card-checkout-item-${item.id}`}>
                  <div className="w-16 h-20 bg-muted flex-shrink-0 overflow-hidden">
                    {item.product?.primaryImage && (
                      <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                    {item.colorName && <p className="text-xs text-muted-foreground">Colour: {item.colorName}</p>}
                    {item.sizeLabel && <p className="text-xs text-muted-foreground">Size: {item.sizeLabel}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium flex-shrink-0">₹{((item.product?.price ?? 0) * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{(cart?.subtotal ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-700">Free</span>
                </div>
                <div className="flex justify-between font-medium border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span data-testid="text-total">₹{(cart?.subtotal ?? 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
