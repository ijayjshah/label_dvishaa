import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Banner } from "@workspace/api-client-react";
import { MagneticButton, TextReveal, motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";
import { brandGold, glassPanelDark } from "./theme";

type HeroSlide = {
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  imageUrl?: string;
};

type HeroSliderProps = {
  banners: Banner[];
};

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    title: "Wear Your Story",
    subtitle: "Handcrafted womenswear from Surat.",
    linkUrl: "/products",
  },
];

export function HeroSlider({ banners }: HeroSliderProps) {
  const reduceMotion = useReducedMotion();
  const slides: HeroSlide[] = banners.length > 0 ? banners : FALLBACK_SLIDES;
  const [active, setActive] = useState(0);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 600], [0, reduceMotion ? 0 : 80]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, reduceMotion ? 1 : 0.85]);

  const goTo = useCallback(
    (index: number) => {
      if (index === active) return;
      setActive(index);
    },
    [active],
  );

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length]);

  const slide = slides[active];
  const imageUrl = slide?.imageUrl;
  const outlineWord = slide.title.split(" ").pop() ?? slide.title;

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground min-h-[100svh]">
      {/* Background imagery with parallax */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${active}`}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: motionEase }}
            className="absolute inset-0"
            style={{ y: imageY }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={cn(
                  "absolute inset-0 w-full h-full object-cover opacity-50",
                  !reduceMotion && "animate-hero-kenburns",
                )}
              />
            ) : (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse at 30% 60%, hsl(40 60% 80%) 0%, transparent 70%)",
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 70% 30%, ${brandGold}1F, transparent 55%)`,
          }}
        />
      </div>

      {/* Decorative geometry */}
      {!reduceMotion && (
        <>
          <div
            className="pointer-events-none absolute -right-16 top-1/4 h-48 w-48 rounded-full border border-white/10 animate-rotate-slow hidden sm:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-[8%] bottom-[28%] h-px w-24 bg-white/20 origin-left rotate-[30deg]"
            aria-hidden
          />
        </>
      )}

      {/* Oversized outline typography */}
      <div
        className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-end overflow-hidden pr-0 lg:pr-[4%]"
        aria-hidden
      >
        <span className="font-serif text-[clamp(5rem,18vw,16rem)] font-normal leading-none tracking-[-0.04em] text-white/[0.04] select-none uppercase">
          {outlineWord}
        </span>
      </div>

      {/* Split editorial layout */}
      <motion.div
        className="relative z-10 grid min-h-[100svh] lg:grid-cols-12 max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 lg:px-12"
        style={{ opacity: contentOpacity }}
      >
        <div className="lg:col-span-7 flex flex-col justify-end pb-32 sm:pb-36 lg:pb-36 pt-24 sm:pt-28 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: motionEase }}
            >
              <motion.p
                className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.28em] uppercase text-white/60 mb-5 sm:mb-6"
                initial={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: motionEase }}
              >
                New Collection
              </motion.p>

              <TextReveal
                as="h1"
                text={slide.title}
                className="font-serif text-[clamp(2rem,8vw,5.5rem)] font-normal text-white leading-[0.95] tracking-[-0.03em] mb-5 sm:mb-6 max-w-2xl"
                delay={0.15}
              />

              {slide.subtitle && (
                <motion.p
                  className="font-sans text-sm sm:text-base font-light text-white/70 leading-relaxed mb-10 sm:mb-12 max-w-md"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45, ease: motionEase }}
                >
                  {slide.subtitle}
                </motion.p>
              )}

              <MagneticButton>
                <Link
                  href={slide.linkUrl ?? "/products"}
                  className={cn(
                    "inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full min-h-[44px]",
                    glassPanelDark,
                    "text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-white",
                    "transition-all duration-500 hover:bg-white/15 hover:border-white/30",
                  )}
                >
                  Explore Collections
                  <span className="inline-block w-6 h-px bg-white/60 group-hover:w-8 transition-all duration-300" />
                </Link>
              </MagneticButton>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right column — editorial accent on desktop */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-end items-end pb-36">
          {slides.length > 1 && (
            <div className="flex flex-col items-end gap-6">
              <span className="text-[11px] font-sans tabular-nums tracking-[0.3em] text-white/50">
                {String(active + 1).padStart(2, "0")}
                <span className="mx-3 text-white/25">—</span>
                {String(slides.length).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      "group flex items-center gap-3 transition-all duration-500",
                      i === active ? "opacity-100" : "opacity-40 hover:opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "h-px transition-all duration-500 bg-white",
                        i === active ? "w-12" : "w-6 group-hover:w-8",
                      )}
                    />
                    <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile slide controls */}
      {slides.length > 1 && (
        <div className="lg:hidden absolute bottom-20 sm:bottom-24 right-4 sm:right-8 flex items-center gap-3 sm:gap-4 z-20">
          <span className="text-[10px] font-sans tabular-nums tracking-[0.25em] text-white/50">
            {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1 min-w-[16px] transition-all duration-500 rounded-full",
                  i === active ? "w-8 bg-white" : "w-4 bg-white/35 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <a
        href="#explore-products"
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 sm:gap-2 text-white/50 hover:text-white/80 transition-colors min-h-[44px] justify-end pb-1"
        aria-label="Scroll to featured pieces"
      >
        <span className="text-[9px] font-sans tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown
          className={cn("w-4 h-4", !reduceMotion && "animate-scroll-hint")}
          strokeWidth={1.5}
        />
      </a>
    </section>
  );
}
