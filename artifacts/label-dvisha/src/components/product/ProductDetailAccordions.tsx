import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { FixedProductDetailSection } from "@/lib/product-fabric-care";

type Props = {
  sections: readonly FixedProductDetailSection[];
  openSections: Record<string, boolean>;
  onToggle: (id: string) => void;
};

const contentVariants = {
  collapsed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.42, ease: motionEase }, opacity: { duration: 0.32, delay: 0.06, ease: motionEase } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.34, ease: motionEase }, opacity: { duration: 0.18, ease: motionEase } },
  },
};

export function ProductDetailAccordions({ sections, openSections, onToggle }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="mt-8 pt-8 border-t border-border/60">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-5">Product Details</p>
      <div className="space-y-2">
        {sections.map((section, index) => {
          const isOpen = openSections[section.id] ?? false;
          return (
            <motion.div
              key={section.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: motionEase }}
              className={cn(
                "group overflow-hidden rounded-lg border bg-gradient-to-b from-background to-muted/20",
                "transition-[border-color,box-shadow] duration-500 ease-out",
                isOpen
                  ? "border-foreground/15 shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.12)]"
                  : "border-border/50 hover:border-border hover:shadow-[0_4px_20px_-14px_hsl(var(--foreground)/0.08)]",
              )}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => onToggle(section.id)}
                aria-expanded={isOpen}
                data-testid={`button-section-${section.id}`}
              >
                <span
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors duration-300",
                    isOpen ? "text-foreground" : "text-foreground/85 group-hover:text-foreground",
                  )}
                >
                  {section.title}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.32, ease: motionEase }}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                    isOpen
                      ? "border-foreground/20 bg-foreground/5"
                      : "border-border/70 bg-muted/30 group-hover:border-foreground/15 group-hover:bg-muted/50",
                  )}
                >
                  <Plus className="h-3.5 w-3.5 text-foreground/65" strokeWidth={1.75} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    variants={reduce ? undefined : contentVariants}
                    initial="collapsed"
                    animate="open"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border/40">
                      {section.type === "text" ? (
                        <motion.p
                          initial={reduce ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.08, ease: motionEase }}
                          className="text-sm text-muted-foreground leading-relaxed pt-4"
                        >
                          {section.content}
                        </motion.p>
                      ) : (
                        <ul className="pt-4 space-y-3">
                          {section.items.map((item, itemIndex) => (
                            <motion.li
                              key={item}
                              initial={reduce ? false : { opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.32, delay: 0.06 + itemIndex * 0.045, ease: motionEase }}
                              className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/50" aria-hidden />
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
