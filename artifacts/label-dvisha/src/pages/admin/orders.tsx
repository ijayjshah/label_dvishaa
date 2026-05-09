import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminOrders, getListAdminOrdersQueryKey, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  const { data, isLoading } = useListAdminOrders({ page, status: statusFilter as any });
  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
        setStatusOpen(false);
        toast({ title: "Order status updated" });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
  });

  function openStatusModal(order: any) {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber ?? "");
    setStatusOpen(true);
  }

  return (
    <AdminLayout title="Orders">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setStatusFilter(undefined); setPage(1); }}
            className={`px-3 py-1.5 text-xs border transition-colors ${!statusFilter ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
            data-testid="filter-all"
          >
            All ({total})
          </button>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs border capitalize transition-colors ${statusFilter === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
              data-testid={`filter-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-background border border-border h-16 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-xl">No orders found</p>
        </div>
      ) : (
        <>
          <div className="bg-background border border-border divide-y divide-border">
            {orders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-4 flex-wrap" data-testid={`row-order-${order.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">#{order.orderNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? "bg-muted"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customerName} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">₹{order.total.toLocaleString("en-IN")}</span>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => openStatusModal(order)} data-testid={`button-update-${order.id}`}>
                    Update Status
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Update Order #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={newStatus} onChange={e => setNewStatus(e.target.value)} data-testid="select-status">
                {statuses.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tracking Number (optional)</label>
              <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="AWB123..." data-testid="input-tracking" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 text-xs tracking-widest uppercase" onClick={() => updateStatus.mutate({ id: selectedOrder.id, data: { status: newStatus } })} disabled={updateStatus.isPending} data-testid="button-save-status">
                {updateStatus.isPending ? "Saving..." : "Update"}
              </Button>
              <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
