import { Link } from "wouter";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { useListSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";
import { MagneticButton, motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";

export function Footer() {
  const { data: settings } = useListSettings();
  const byKey = useMemo(() => {
    const m: Record<string, string> = {};
    (settings ?? []).forEach((s) => {
      m[s.key] = s.value;
    });
    return m;
  }, [settings]);

  const phone = byKey.store_phone || "+91 79904 14960";
  const email = byKey.store_email || "Labeldvisha4345@gmail.com";
  const address =
    byKey.store_address ||
    "Sukan Residency Nr, TGB Circle Opp Saurabh Society, Behind Saurabh Police Chowky, Pal Adajan Gam, Surat 395009";
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
  const hoverLink = "transition-all duration-300 hover:text-[#EDE8E0] hover:translate-x-0.5 inline-flex items-center gap-1";
  const reduceMotion = useReducedMotion();

  return (
    <motion.footer
      className="mt-20 bg-[#2D1E17] text-[#EDE8E0] font-sans antialiased overflow-hidden"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: motionEase }}
    >
      <span
        className="pointer-events-none absolute -left-4 bottom-0 font-serif text-[clamp(5rem,18vw,14rem)] text-[#EDE8E0]/[0.04] leading-none tracking-[-0.04em] select-none uppercase"
        aria-hidden
      >
        Dvisha
      </span>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-14 sm:pt-20 md:pt-24 pb-8 sm:pb-10 relative">
        <div className="grid lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 pb-12 sm:pb-16 md:pb-20 border-b border-[#EDE8E0]/10">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block">
              <BrandLogo framed imgClassName="h-10 sm:h-12 w-auto max-w-[240px] object-contain" />
            </div>
            <p className={`text-sm sm:text-[15px] leading-relaxed max-w-sm ${muted}`}>
              Crafting timeless elegance through bespoke fashion. Made with love in Surat, India.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-[#EDE8E0] transition-all duration-300 hover:bg-white/15 hover:scale-105"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href={`mailto:${email}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-[#EDE8E0] transition-all duration-300 hover:bg-white/15 hover:scale-105"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-8">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium mb-5 sm:mb-6 text-[#EDE8E0] tracking-[-0.01em]">
                Quick Links
              </h3>
              <ul className={`space-y-3.5 text-sm ${muted}`}>
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Custom Orders", href: "/custom-order" },
                  { label: "Gallery", href: "/gallery" },
                  { label: "Journal", href: "/blogs" },
                  { label: "Contact", href: "/contact" },
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
              <h3 className="font-serif text-base sm:text-lg font-medium mb-5 sm:mb-6 text-[#EDE8E0] tracking-[-0.01em]">
                Customer Care
              </h3>
              <ul className={`space-y-3.5 text-sm ${muted}`}>
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
              <h3 className="font-serif text-base sm:text-lg font-medium mb-5 sm:mb-6 text-[#EDE8E0] tracking-[-0.01em]">
                Get in Touch
              </h3>
              <ul className={`space-y-4 text-sm ${muted}`}>
                <li className="flex gap-3 items-start group">
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
        </div>

        {/* Newsletter showcase */}
        <div className="py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-[#EDE8E0] mb-2 sm:mb-3 tracking-[-0.02em] leading-[1.1]">
              Stay in the Loop
            </h3>
            <p className={`text-sm sm:text-[15px] max-w-md leading-relaxed ${muted}`}>
              Subscribe for exclusive offers, styling tips, and new collection updates
            </p>
          </div>

          <form onSubmit={onNewsletter} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="rounded-full border border-[#EDE8E0]/25 bg-[#EDE8E0]/5 backdrop-blur-sm text-[#EDE8E0] placeholder:text-[#EDE8E0]/40 h-12 px-6 shadow-none focus-visible:ring-1 focus-visible:ring-[#EDE8E0]/30 flex-1"
            />
            <MagneticButton>
              <Button
                type="submit"
                className="rounded-full h-12 px-8 shrink-0 bg-[#EDE8E0] text-[#2D1E17] hover:bg-white border-0 font-medium tracking-wide transition-all duration-300"
              >
                Subscribe
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" strokeWidth={1.5} />
              </Button>
            </MagneticButton>
          </form>
        </div>

        <div
          className={cn(
            "pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs border-t border-[#EDE8E0]/10",
            muted,
          )}
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
            <span className="text-[#EDE8E0]/90">Made with ❤️ AttachToTech.</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
