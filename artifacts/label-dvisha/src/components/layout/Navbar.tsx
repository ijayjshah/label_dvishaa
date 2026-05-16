import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGetCart, getGetCartQueryKey, useListCategories, type Category } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const staticNav = [
  { href: "/custom-order", label: "Custom Order" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });
  const { data: categoriesRaw } = useListCategories();

  const itemCount = cart?.itemCount ?? 0;

  const categories = useMemo(() => (categoriesRaw ?? []).filter((c) => c.isActive), [categoriesRaw]);
  const roots = useMemo(
    () =>
      categories
        .filter((c) => c.parentId == null)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const childrenByParent = useMemo(() => {
    const m = new Map<number, Category[]>();
    for (const c of categories) {
      if (c.parentId == null) continue;
      const list = m.get(c.parentId) ?? [];
      list.push(c);
      m.set(c.parentId, list);
    }
    for (const [, list] of m) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return m;
  }, [categories]);

  function handleLogout() {
    logout();
    setLocation("/");
  }

  function navLinkClass(href: string) {
    const path = href.split("#")[0] || href;
    let active = false;
    if (path && path !== "/") {
      if (path === "/blogs") active = location.startsWith("/blogs");
      else if (path === "/products") active = location.startsWith("/products");
      else if (path === "/about") active = location === path;
      else active = location === path;
    }
    return cn(
      "text-sm transition-colors font-sans tracking-wide",
      active ? "text-foreground font-medium" : "text-foreground/85 hover:text-foreground",
    );
  }

  const collectionsActive = location.startsWith("/collections") || location.startsWith("/products");
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className="sticky top-0 z-50 bg-[#F5F5F5]/95 backdrop-blur-sm border-b border-border/60"
      initial={reduceMotion ? false : { y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <button
            className="md:hidden p-2 text-foreground -ml-2"
            onClick={() => setOpen(!open)}
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href="/"
            className="font-serif text-lg sm:text-xl text-foreground tracking-wide md:min-w-[140px] absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto"
            data-testid="link-logo"
          >
            Label Dvisha
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8">
            {/* Categories mega menu */}
            <div
              className="relative group"
              onMouseLeave={() => {
                /* keep open while moving to panel via CSS gap */
              }}
            >
              <button
                type="button"
                className={cn(
                  "text-sm font-sans tracking-wide inline-flex items-center gap-1 py-2 border-b-2 border-transparent",
                  collectionsActive
                    ? "text-foreground font-medium border-foreground/80"
                    : "text-foreground/85 hover:text-foreground",
                )}
                aria-expanded="false"
                aria-haspopup="true"
              >
                Categories
                <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[min(calc(100vw-2rem),56rem)]",
                  "opacity-0 invisible pointer-events-none",
                  "group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto",
                  "transition-opacity duration-150",
                )}
              >
                <div className="rounded-xl border border-border/80 bg-background shadow-xl px-8 py-8">
                  {roots.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      <Link href="/products" className="underline underline-offset-4">
                        View all pieces
                      </Link>
                    </div>
                  ) : (
                    <div
                      className="grid gap-8 text-left"
                      style={{ gridTemplateColumns: `repeat(${Math.min(roots.length, 4)}, minmax(0, 1fr))` }}
                    >
                      {roots.map((root) => {
                        const subs = childrenByParent.get(root.id) ?? [];
                        return (
                          <div key={root.id} className="min-w-0">
                            <Link
                              href={`/collections/${root.slug}`}
                              className="font-serif text-base text-foreground hover:underline decoration-foreground/40 underline-offset-4 block mb-3"
                            >
                              {root.name}
                            </Link>
                            <ul className="space-y-2">
                              {subs.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/collections/${root.slug}?sub=${encodeURIComponent(sub.slug)}`}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                              {subs.length === 0 && (
                                <li>
                                  <Link
                                    href={`/collections/${root.slug}`}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    Shop collection
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-6 pt-5 border-t border-border/60 text-center">
                    <Link href="/products" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground">
                      All collections
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {staticNav.map((link) => (
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
        <div className="md:hidden border-t border-border/60 bg-[#F5F5F5] max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto">
          <nav className="flex flex-col py-2">
            <button
              type="button"
              className="px-6 py-3 text-sm font-sans flex items-center justify-between hover:bg-black/5 text-left w-full"
              onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
            >
              <span className={collectionsActive ? "font-medium text-foreground" : "text-foreground/90"}>Categories</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", mobileCatsOpen && "rotate-180")} />
            </button>
            {mobileCatsOpen && (
              <div className="px-6 pb-3 space-y-4 border-b border-border/40">
                {roots.map((root) => (
                  <div key={root.id}>
                    <Link
                      href={`/collections/${root.slug}`}
                      className="font-serif text-sm text-foreground block mb-2"
                      onClick={() => {
                        setOpen(false);
                        setMobileCatsOpen(false);
                      }}
                    >
                      {root.name}
                    </Link>
                    <ul className="pl-2 space-y-1.5 border-l border-border/60">
                      {(childrenByParent.get(root.id) ?? []).map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/collections/${root.slug}?sub=${encodeURIComponent(sub.slug)}`}
                            className="text-xs text-muted-foreground"
                            onClick={() => {
                              setOpen(false);
                              setMobileCatsOpen(false);
                            }}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link
                  href="/products"
                  className="text-xs tracking-widest uppercase text-muted-foreground block pt-2"
                  onClick={() => setOpen(false)}
                >
                  All collections
                </Link>
              </div>
            )}
            {staticNav.map((link) => (
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
    </motion.header>
  );
}
