import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { brandBorderWarm } from "./theme";

const ITEMS = [
  "Handcrafted in Surat",
  "Made to Order",
  "Slow Fashion",
  "Custom Tailoring",
  "Label Dvisha",
  "Wear Your Story",
];

export function PremiumMarquee() {
  const reduceMotion = useReducedMotion();
  const track = [...ITEMS, ...ITEMS];

  return (
    <section
      className="overflow-hidden border-y bg-background py-4 sm:py-5 md:py-6"
      style={{ borderColor: `${brandBorderWarm}99` }}
      aria-label="Brand highlights"
    >
      <div className="marquee-mask overflow-hidden">
        <div
          className={cn(
            "flex w-max items-center gap-0 animate-marquee",
            reduceMotion && "!animate-none justify-center flex-wrap gap-x-8 gap-y-2 px-6",
          )}
        >
          {track.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center shrink-0 font-sans text-[10px] sm:text-[11px] md:text-xs font-light tracking-[0.22em] sm:tracking-[0.25em] uppercase text-muted-foreground/70 whitespace-nowrap"
            >
              {item}
              <span
                className="mx-6 sm:mx-10 inline-block w-1 h-1 rounded-full"
                style={{ backgroundColor: brandBorderWarm }}
                aria-hidden
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
