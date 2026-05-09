import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <p className="font-serif text-xl tracking-widest mb-3">LABEL DVISHA</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Handcrafted womenswear rooted in Indian textile traditions. Each piece is made with intention — for women who wear their stories with grace.
            </p>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Shop</p>
            <ul className="space-y-2">
              {[
                { href: "/products", label: "All Collections" },
                { href: "/products?featured=true", label: "Featured" },
                { href: "/gallery", label: "Lookbook" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Help</p>
            <ul className="space-y-2">
              {[
                { href: "/orders", label: "Track Order" },
                { href: "#", label: "Size Guide" },
                { href: "#", label: "Care Instructions" },
                { href: "#", label: "Contact Us" },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Label Dvisha. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made with care in India</p>
        </div>
      </div>
    </footer>
  );
}
