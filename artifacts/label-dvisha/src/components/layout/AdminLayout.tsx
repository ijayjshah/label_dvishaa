import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Image,
  Megaphone,
  Ruler,
  Sparkles,
  Mail,
  Home,
  LogOut,
  Menu,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/custom-orders", label: "Custom orders", icon: Sparkles },
  { href: "/admin/contact-messages", label: "Messages", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/banners", label: "Banners", icon: Megaphone },
  { href: "/admin/sizes", label: "Sizes", icon: Ruler },
  { href: "/admin/blogs", label: "Blog", icon: BookOpen },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    setLocation("/");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-border/80 bg-gradient-to-br from-muted/40 via-transparent to-transparent">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/30" aria-hidden />
          <div className="min-w-0">
            <Link href="/" className="block hover:opacity-90 transition-opacity">
              <BrandLogo imgClassName="h-9 w-auto max-w-[200px] object-contain object-left" />
            </Link>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20 ring-1 ring-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/90"
              }`}
              data-testid={`link-admin-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "opacity-100" : "opacity-80"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border/80 bg-muted/25 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
          data-testid="link-admin-storefront"
        >
          <Home className="w-4 h-4 opacity-80" />
          View Storefront
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          data-testid="button-admin-logout"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-muted/45 via-background to-muted/25">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-background/95 backdrop-blur-sm border-r border-border/70 flex-shrink-0 shadow-[4px_0_32px_-8px_rgba(45,30,23,0.12)]">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 max-w-[85vw] bg-background border-r border-border/70 flex flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 h-14 border-b border-border/70 bg-background/90 backdrop-blur-md flex items-center px-4 sm:px-8 gap-4 flex-shrink-0 shadow-sm shadow-black/[0.03]">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-1"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-admin-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {title && (
            <h1 className="font-serif text-xl sm:text-2xl text-foreground tracking-tight">{title}</h1>
          )}
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
