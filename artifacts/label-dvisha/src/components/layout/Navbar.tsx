import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/products", label: "Categories" },
  { href: "/custom-order", label: "Custom Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });

  const itemCount = cart?.itemCount ?? 0;

  function handleLogout() {
    logout();
    setLocation("/");
  }

  function navLinkClass(href: string) {
    const path = href.split("#")[0] || href;
    let active = false;
    if (path && path !== "/") {
      if (path === "/products") active = location.startsWith("/products");
      else active = location === path;
    }
    return (
      "text-sm transition-colors font-sans tracking-wide " +
      (active ? "text-foreground font-medium" : "text-foreground/85 hover:text-foreground")
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F5F5F5]/95 backdrop-blur-sm border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 text-foreground -ml-2"
            onClick={() => setOpen(!open)}
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand */}
          <Link
            href="/"
            className="font-serif text-lg sm:text-xl text-foreground tracking-wide md:min-w-[140px] absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto"
            data-testid="link-logo"
          >
            Label Dvisha
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(link.href)}
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" data-testid="link-my-orders">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" data-testid="link-admin-dashboard">
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    data-testid="button-logout"
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="text-xs font-sans hidden sm:inline-flex">
                <Link href="/login" data-testid="link-login">
                  Sign In
                </Link>
              </Button>
            )}

            <Link href="/cart" className="relative p-2" data-testid="link-cart">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2D1E17] text-white text-[10px] rounded-full flex items-center justify-center font-medium"
                  data-testid="text-cart-count"
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-[#F5F5F5]">
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-6 py-3 text-sm font-sans hover:bg-black/5 ${navLinkClass(link.href)}`}
                onClick={() => setOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/gallery"
              className="px-6 py-3 text-sm font-sans text-foreground/90 hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Gallery
            </Link>
            {!user && (
              <Link
                href="/login"
                className="px-6 py-3 text-sm font-sans text-foreground/90 hover:bg-black/5"
                onClick={() => setOpen(false)}
                data-testid="link-mobile-login"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
