import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";

export type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  occasion: string;
};

type ReviewsCarouselProps = {
  reviews: Review[];
  intervalMs?: number;
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function ReviewsCarousel({ reviews, intervalMs = 5500, className }: ReviewsCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (reduceMotion || reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % reviews.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, reduceMotion, reviews.length]);

  function goTo(index: number) {
    if (index === active) return;
    setDirection(index > active ? 1 : -1);
    setActive(index);
  }

  const review = reviews[active];
  if (!review) return null;

  const slideVariants = {
    enter: (d: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : d * 48,
      scale: reduceMotion ? 1 : 0.97,
      filter: reduceMotion ? "blur(0px)" : "blur(6px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (d: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : d * -48,
      scale: reduceMotion ? 1 : 0.97,
      filter: reduceMotion ? "blur(0px)" : "blur(6px)",
    }),
  };

  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: motionEase }}
    >
      <motion.div
        className="relative overflow-hidden rounded-[1.75rem] border border-[#2D1E17]/10 bg-white/70 px-6 py-10 sm:px-10 sm:py-12 shadow-[0_24px_60px_-28px_rgba(45,30,23,0.35)] backdrop-blur-sm"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  "0 24px 60px -28px rgba(45,30,23,0.35)",
                  "0 28px 70px -24px rgba(45,30,23,0.42)",
                  "0 24px 60px -28px rgba(45,30,23,0.35)",
                ],
              }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Quote
          className="absolute right-6 top-6 h-10 w-10 text-[#2D1E17]/8 sm:right-8 sm:top-8 sm:h-12 sm:w-12"
          aria-hidden
        />

        <motion.div
          className="mb-6 flex items-center gap-1"
          key={`stars-${review.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: motionEase }}
        >
          {Array.from({ length: review.rating }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.06, ease: motionEase }}
            >
              <Star className="h-4 w-4 fill-[#C4A574] text-[#C4A574]" aria-hidden />
            </motion.span>
          ))}
          <span className="sr-only">{review.rating} out of 5 stars</span>
        </motion.div>

        <motion.p
          className="mb-2 text-[0.65rem] font-sans uppercase tracking-[0.22em] text-[#2D1E17]/50"
          key={`occasion-${review.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          {review.occasion}
        </motion.p>

        <motion.div className="relative min-h-[9.5rem] sm:min-h-[8rem]" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.blockquote
              key={review.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: motionEase }}
              className="absolute inset-0"
            >
              <p className="font-serif text-xl sm:text-2xl leading-relaxed text-[#2D1E17] md:text-[1.65rem] md:leading-snug">
                &ldquo;{review.text}&rdquo;
              </p>
            </motion.blockquote>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`meta-${review.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: motionEase }}
            className="mt-8 flex items-center gap-4 border-t border-[#2D1E17]/10 pt-6"
          >
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2D1E17] font-serif text-sm text-[#F9F5F1] sm:h-12 sm:w-12 sm:text-base"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.35, ease: motionEase }}
            >
              {initials(review.name)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: motionEase }}
            >
              <p className="font-sans text-sm font-medium text-[#2D1E17] sm:text-base">{review.name}</p>
              <p className="font-sans text-xs text-[#2D1E17]/55 sm:text-sm">{review.location}</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-8 flex items-center justify-center gap-2.5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {reviews.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show review ${index + 1} from ${item.name}`}
            aria-current={index === active ? "true" : undefined}
            className="group relative flex h-2.5 items-center justify-center p-1"
          >
            <motion.span
              className={cn(
                "block h-1.5 rounded-full bg-[#2D1E17]/20 transition-colors group-hover:bg-[#2D1E17]/40",
                index === active ? "bg-[#2D1E17]" : "w-1.5",
              )}
              animate={index === active ? { width: 28 } : { width: 6 }}
              transition={{ duration: 0.35, ease: motionEase }}
            />
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
