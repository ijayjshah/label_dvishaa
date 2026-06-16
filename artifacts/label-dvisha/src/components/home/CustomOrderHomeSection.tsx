import { Link } from "wouter";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Leaf } from "lucide-react";
import { Reveal, RevealStagger, revealItemVariants, motionEase, MagneticButton } from "@/components/motion";
import { cn } from "@/lib/utils";
import { brandBrown, brandCream, homeLinkUnderline, imageHoverZoom, sectionPadding } from "./theme";

const FEATURES = [
  { title: "Custom Fit", desc: "Tailored to your measurements", icon: Scissors },
  { title: "Premium Fabric", desc: "Quality materials, all-day comfort", icon: Sparkles },
  { title: "Made to Order", desc: "Thoughtful, sustainable production", icon: Leaf },
];

export function CustomOrderHomeSection() {
  return (
    <>
      <section className="text-white" style={{ backgroundColor: brandBrown }}>
        <div className={cn(sectionPadding, "max-w-[90rem] mx-auto")}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
            <Reveal y={18} viewMargin="-80px 0px -40px 0px" className="lg:col-span-5 order-2 lg:order-1">
              <p className="text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-white/70 mb-4 sm:mb-5">
                Bespoke
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.75rem] font-normal tracking-[-0.03em] leading-[1.08] mb-5 sm:mb-6">
                Design your own outfit
              </h2>
              <p className="font-sans text-sm sm:text-[15px] font-light text-white/90 leading-relaxed mb-8 sm:mb-10 max-w-md">
                Upload inspiration, choose fabrics, and customize measurements — create something uniquely yours.
              </p>
              <MagneticButton>
                <Link
                  href="/custom-order"
                  className={cn(
                    homeLinkUnderline,
                    "text-white px-5 sm:px-6 py-3 rounded-full min-h-[44px] bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-400",
                  )}
                  data-testid="link-start-customization"
                >
                  Start customization
                </Link>
              </MagneticButton>
            </Reveal>

            <Reveal y={18} delay={0.08} viewMargin="-80px 0px -40px 0px" className="lg:col-span-7 order-1 lg:order-2">
              <motion.div
                className="relative aspect-[4/5] max-h-[420px] sm:max-h-[480px] lg:max-h-[560px] w-full mx-auto max-w-md lg:max-w-none overflow-hidden rounded-2xl border border-white/10 bg-white/10"
                data-testid="custom-order-hero-visual"
                whileHover={{ scale: 1.008 }}
                transition={{ duration: 0.7, ease: motionEase }}
              >
                <img
                  src="/custom-order-hero.png"
                  alt="Custom design"
                  className={cn("absolute inset-0 w-full h-full object-cover", imageHoverZoom)}
                />
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={cn(sectionPadding, "max-w-[90rem] mx-auto")} style={{ backgroundColor: brandCream }}>
        <RevealStagger
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
          stagger={0.1}
        >
          {FEATURES.map((item) => (
            <motion.div
              key={item.title}
              variants={revealItemVariants}
              className="group relative p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] bg-white/50 hover:shadow-[0_16px_48px_-16px_rgba(60,42,33,0.12)] transition-all duration-500"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E2D9] bg-white/80 group-hover:scale-105 transition-transform duration-500">
                <item.icon className="w-5 h-5" style={{ color: brandBrown }} strokeWidth={1.25} />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-[-0.02em] mb-2" style={{ color: brandBrown }}>
                {item.title}
              </h3>
              <p className="font-sans text-sm font-light leading-relaxed opacity-85" style={{ color: brandBrown }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </RevealStagger>
      </section>
    </>
  );
}
