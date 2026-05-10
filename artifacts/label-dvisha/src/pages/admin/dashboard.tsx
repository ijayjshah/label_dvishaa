import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminDashboard, type DashboardCustomOrderSummary } from "@workspace/api-client-react";
import { ShoppingBag, Users, Package, DollarSign, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-50",
  confirmed: "text-blue-700 bg-blue-50",
  processing: "text-purple-700 bg-purple-50",
  shipped: "text-cyan-700 bg-cyan-50",
  delivered: "text-green-700 bg-green-50",
  cancelled: "text-red-700 bg-red-50",
};

const customOrderStatusColors: Record<string, string> = {
  pending: "text-amber-800 bg-amber-50",
  contacted: "text-sky-800 bg-sky-50",
  in_progress: "text-violet-800 bg-violet-50",
  completed: "text-emerald-800 bg-emerald-50",
  cancelled: "text-muted-foreground bg-muted",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminDashboard();

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Total Customers", value: stats?.totalUsers ?? 0, icon: Users, href: "/admin/users" },
    { label: "Top Products", value: stats?.topProducts?.length ?? 0, icon: Package, href: "/admin/products" },
    { label: "Total Revenue", value: stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString("en-IN")}` : "₹0", icon: DollarSign, href: "/admin/orders" },
    { label: "Orders Today", value: stats?.todayOrders ?? 0, icon: TrendingUp, href: "/admin/orders" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Clock, href: "/admin/orders" },
    { label: "Custom order requests", value: stats?.totalCustomOrderRequests ?? 0, icon: Sparkles, href: "/admin/custom-orders" },
    { label: "Pending custom requests", value: stats?.pendingCustomOrderRequests ?? 0, icon: Sparkles, href: "/admin/custom-orders" },
  ];

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-background border border-border p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="h-7 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {cards.map(card => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="bg-background border border-border p-5 hover:border-primary transition-colors group"
                  data-testid={`card-stat-${card.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground tracking-wider">{card.label}</p>
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground" data-testid={`value-stat-${card.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {card.value}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent orders */}
            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="bg-background border border-border">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-serif text-lg">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {stats.recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between px-5 py-4" data-testid={`row-order-${order.id}`}>
                      <div>
                        <p className="text-sm font-medium">#{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{order.customerName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? "bg-muted"}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-medium">₹{order.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent custom order requests */}
            {stats?.recentCustomOrderRequests && stats.recentCustomOrderRequests.length > 0 && (
              <div className="bg-background border border-border">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-serif text-lg">Recent custom requests</h2>
                  <Link href="/admin/custom-orders" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {stats.recentCustomOrderRequests.map((row: DashboardCustomOrderSummary) => (
                    <Link
                      key={row.id}
                      href="/admin/custom-orders"
                      className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-muted/40 transition-colors"
                      data-testid={`row-custom-order-dash-${row.id}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Request #{row.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {row.userEmail ?? row.userName ?? "Guest"} · {new Date(row.createdAt).toLocaleString("en-IN")}
                        </p>
                        {row.description && (
                          <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{row.description}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${customOrderStatusColors[row.status] ?? "bg-muted"}`}
                      >
                        {row.status.replace("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
