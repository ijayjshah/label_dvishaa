import { Link } from "wouter";
import { Upload, Sparkles, Gem, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";

const BROWN = "#3C2A21";
const CREAM = "#F5F5F5";

export function CustomOrderHomeSection() {
  return (
    <>
      <section className="text-white" style={{ backgroundColor: BROWN }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal y={32} viewMargin="-80px 0px -40px 0px">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight mb-5">
                Design Your Own Outfit
              </h2>
              <p className="font-sans text-sm sm:text-base leading-relaxed text-white/90 mb-8 max-w-xl">
                Bring your vision to life. Upload inspiration, choose fabrics, customize measurements,
                and create something uniquely yours.
              </p>
              <ul className="space-y-3.5 mb-10 text-sm sm:text-base text-white/90 font-sans">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5 opacity-90" strokeWidth={1.5} />
                  <span>Personalized design consultation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Gem className="w-5 h-5 shrink-0 mt-0.5 opacity-90" strokeWidth={1.5} />
                  <span>Premium quality fabrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Compass className="w-5 h-5 shrink-0 mt-0.5 opacity-90" strokeWidth={1.5} />
                  <span>Made to measure perfection</span>
                </li>
              </ul>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 h-12 font-sans font-medium tracking-wide hover:bg-white/95"
                style={{ color: BROWN }}
              >
                <Link href="/custom-order" className="inline-flex items-center gap-2" data-testid="link-start-customization">
                  <Upload className="w-4 h-4" strokeWidth={2} />
                  Start Customization
                </Link>
              </Button>
            </Reveal>
            <Reveal y={32} delay={0.1} viewMargin="-80px 0px -40px 0px">
              <div
                className="relative aspect-[4/5] max-h-[520px] mx-auto w-full rounded-2xl overflow-hidden bg-white/10 border border-white/10"
                data-testid="custom-order-hero-visual"
              >
                <img
                  src="/custom-order-hero.png"
                  alt="Custom design"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: CREAM }}>
        <RevealStagger className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 md:gap-8 text-center md:text-left" stagger={0.1}>
          <motion.div variants={revealItemVariants}>
            <h3 className="font-serif text-xl sm:text-2xl mb-2" style={{ color: BROWN }}>
              Custom Fit
            </h3>
            <p className="font-sans text-sm leading-relaxed opacity-85" style={{ color: BROWN }}>
              Tailored precisely to your measurements
            </p>
          </motion.div>
          <motion.div variants={revealItemVariants}>
            <h3 className="font-serif text-xl sm:text-2xl mb-2" style={{ color: BROWN }}>
              Breathable Fabric
            </h3>
            <p className="font-sans text-sm leading-relaxed opacity-85" style={{ color: BROWN }}>
              Premium materials for all-day comfort
            </p>
          </motion.div>
          <motion.div variants={revealItemVariants}>
            <h3 className="font-serif text-xl sm:text-2xl mb-2" style={{ color: BROWN }}>
              Made to Order
            </h3>
            <p className="font-sans text-sm leading-relaxed opacity-85" style={{ color: BROWN }}>
              Sustainable, thoughtful production
            </p>
          </motion.div>
        </RevealStagger>
      </section>
    </>
  );
}
