import { Link } from "wouter";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useListSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  const { data: settings } = useListSettings();
  const byKey = useMemo(() => {
    const m: Record<string, string> = {};
    (settings ?? []).forEach((s) => {
      m[s.key] = s.value;
    });
    return m;
  }, [settings]);

  const phone = byKey.store_phone || "+91 98765 43210";
  const email = byKey.store_email || "hello@labeldvisha.com";
  const address = byKey.store_address || "Surat, Gujarat, India";
  const instagramUrl = byKey.instagram_url || "https://instagram.com/labeldvisha";

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  function onNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast({
      title: "You're on the list",
      description: "Thanks — we'll send updates and styling tips soon.",
    });
    setNewsletterEmail("");
  }

  const muted = "text-[#EDE8E0]/75";
  const hoverLink = "transition-colors hover:text-[#EDE8E0]";
  const reduceMotion = useReducedMotion();

  return (
    <motion.footer
      className="mt-20 bg-[#2D1E17] text-[#EDE8E0] font-sans antialiased"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 lg:gap-x-8">
          <div className="space-y-4">
            <div className="inline-block">
              <BrandLogo framed imgClassName="h-10 sm:h-11 w-auto max-w-[220px] object-contain" />
            </div>
            <p className={`text-sm leading-relaxed ${muted}`}>
              Crafting timeless elegance through bespoke fashion. Made with love in Surat, India.
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#EDE8E0] transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href={`mailto:${email}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#EDE8E0] transition-colors hover:bg-white/20"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-5 text-[#EDE8E0]">Quick Links</h3>
            <ul className={`space-y-3 text-sm ${muted}`}>
              <li>
                <Link href="/about" className={hoverLink}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className={hoverLink}>
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link href="/gallery" className={hoverLink}>
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/blogs" className={hoverLink}>
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/contact" className={hoverLink}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-5 text-[#EDE8E0]">Customer Care</h3>
            <ul className={`space-y-3 text-sm ${muted}`}>
              {[
                { label: "FAQ", href: "/about#faqs" },
                { label: "Shipping & Delivery", href: "/#" },
                { label: "Returns & Exchange", href: "/#" },
                { label: "Size Guide", href: "/#" },
                { label: "Care Instructions", href: "/#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className={hoverLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-5 text-[#EDE8E0]">Get in Touch</h3>
            <ul className={`space-y-4 text-sm ${muted}`}>
              <li className="flex gap-3 items-start">
                <Phone className="h-4 w-4 shrink-0 mt-0.5 text-[#EDE8E0]/90" strokeWidth={1.5} />
                <a
                  href={`tel:${phone.replace(/[\s-]/g, "")}`}
                  className={`${hoverLink} underline-offset-2`}
                >
                  {phone}
                </a>
              </li>
              <li className="flex gap-3 items-start">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-[#EDE8E0]/90" strokeWidth={1.5} />
                <a href={`mailto:${email}`} className={`${hoverLink} break-all`}>
                  {email}
                </a>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#EDE8E0]/90" strokeWidth={1.5} />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 text-center max-w-lg mx-auto px-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#EDE8E0] mb-2">
            Stay in the Loop
          </h3>
          <p className={`text-sm mb-8 ${muted}`}>
            Subscribe for exclusive offers, styling tips, and new collection updates
          </p>
          <form
            onSubmit={onNewsletter}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="rounded-full border border-[#EDE8E0]/35 bg-[#2D1E17] text-[#EDE8E0] placeholder:text-[#EDE8E0]/45 h-12 px-5 shadow-none focus-visible:ring-1 focus-visible:ring-[#EDE8E0]/40"
            />
            <Button
              type="submit"
              className="rounded-full h-12 px-8 shrink-0 bg-[#EDE8E0] text-[#2D1E17] hover:bg-white border-0 font-medium tracking-wide"
            >
              Subscribe
            </Button>
          </form>
        </div>

        <div
          className={`mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs border-t border-[#EDE8E0]/15 ${muted}`}
        >
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Label Dvisha. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
            <Link href="/#" className={hoverLink}>
              Privacy Policy
            </Link>
            <Link href="/#" className={hoverLink}>
              Terms of Service
            </Link>
            <span className="text-[#EDE8E0]/90">Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
