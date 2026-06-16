import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";
import { homeEyebrow, homeTitle } from "./theme";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "center" | "left";
  className?: string;
  /** Large ghost text behind the header */
  backgroundText?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
  className,
  backgroundText,
}: SectionHeaderProps) {
  const centered = align === "center";
  const ghost = backgroundText ?? title.split(" ").pop() ?? title;

  return (
    <Reveal
      y={18}
      className={cn("relative", centered ? "text-center px-1" : "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-8", className)}
    >
      {backgroundText !== "" && (
        <span
          className={cn(
            "pointer-events-none absolute font-serif text-[clamp(4rem,12vw,9rem)] font-normal leading-none tracking-[-0.04em] text-foreground/[0.04] dark:text-foreground/[0.06] select-none uppercase",
            "hidden sm:block",
            centered ? "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" : "-left-2 sm:-left-4 top-0",
          )}
          aria-hidden
        >
          {ghost}
        </span>
      )}

      <div className={cn("relative z-[1]", centered && "mx-auto max-w-lg")}>
        {eyebrow && (
          <p className={cn(homeEyebrow, "mb-4 sm:mb-5")}>{eyebrow}</p>
        )}
        <h2 className={homeTitle}>{title}</h2>
        {description && (
          <p className="mt-4 font-sans text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-md font-light">
            {description}
          </p>
        )}
        <motion.div
          className={cn("mt-6 h-px bg-gradient-to-r from-foreground/25 via-foreground/10 to-transparent origin-left", centered && "mx-auto origin-center max-w-[120px]")}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.12, ease: motionEase }}
        />
      </div>

      {href && !centered && (
        <Link
          href={href}
          className="group relative z-[1] hidden sm:inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-sans tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 shrink-0 pb-1"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      )}

      {href && centered && (
        <Link
          href={href}
          className="group relative z-[1] mt-10 inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-sans tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      )}
    </Reveal>
  );
}
