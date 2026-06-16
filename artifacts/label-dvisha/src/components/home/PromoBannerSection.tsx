import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import type { Banner } from "@workspace/api-client-react";
import { MagneticButton, Reveal, motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";
import { homeLinkUnderline, sectionBorder } from "./theme";

type PromoBannerSectionProps = {
  banner: Banner;
};

export function PromoBannerSection({ banner }: PromoBannerSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Reveal y={20}>
      <section className={cn("relative overflow-hidden", sectionBorder)}>
        <div className="grid lg:grid-cols-2 min-h-[360px] sm:min-h-[440px] lg:min-h-[520px]">
          {banner.imageUrl ? (
            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden order-2 lg:order-1">
              <img
                src={banner.imageUrl}
                alt=""
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04]",
                  !reduceMotion && "animate-hero-kenburns",
                )}
              />
            </div>
          ) : (
            <div className="hidden lg:block bg-secondary order-2 lg:order-1" />
          )}

          <div className="relative flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-12 sm:py-16 md:py-20 bg-secondary order-1 lg:order-2 overflow-hidden">
            {banner.title && (
              <span
                className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 font-serif text-[clamp(3rem,10vw,7rem)] text-foreground/[0.04] leading-none tracking-[-0.04em] select-none max-w-[50%] text-right hidden sm:block"
                aria-hidden
              >
                {banner.title.split(" ").slice(-1)[0]}
              </span>
            )}

            <div className="relative z-[1] max-w-md">
              {banner.subtitle && (
                <motion.p
                  className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.22em] uppercase text-muted-foreground/80 mb-4 sm:mb-5"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: motionEase }}
                >
                  {banner.subtitle}
                </motion.p>
              )}
              <motion.h2
                className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-normal tracking-[-0.03em] leading-[1.12] mb-6 sm:mb-8 md:mb-10"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.08, ease: motionEase }}
              >
                {banner.title}
              </motion.h2>
              {banner.linkUrl && (
                <MagneticButton>
                  <Link
                    href={banner.linkUrl}
                    className={cn(
                      homeLinkUnderline,
                      "text-foreground px-5 sm:px-6 py-3.5 rounded-full min-h-[44px] border border-foreground/20 bg-background hover:bg-background/80 transition-all duration-400",
                    )}
                  >
                    <span className="relative pb-0.5">
                      Shop Now
                      <span className="absolute bottom-0 left-0 h-px w-full bg-foreground/30 group-hover:w-0 transition-all duration-300 ease-out" />
                      <span className="absolute bottom-0 left-0 h-px w-0 bg-foreground group-hover:w-full transition-all duration-300 ease-out" />
                    </span>
                  </Link>
                </MagneticButton>
              )}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
