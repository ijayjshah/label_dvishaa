import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListGallery } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";

/** Masonry-style editorial grid of gallery images (admin-managed). */
export function EditorialSection() {
  const { data, isLoading } = useListGallery({ page: 1 });
  const items = data?.data?.slice(0, 12) ?? [];

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 px-4 sm:px-6 bg-[#F9F6F1] border-t border-[#E8E2D9]"
      aria-labelledby="editorial-heading"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 sm:mb-14">
          <Reveal>
            <h2
              id="editorial-heading"
              className="font-serif text-4xl sm:text-5xl md:text-[3.25rem] text-foreground tracking-tight mb-4"
            >
              Editorial
            </h2>
            <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Stories told through fabric and form
            </p>
          </Reveal>
        </header>

        {isLoading ? (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-4 sm:mb-5 rounded-xl bg-muted/60 animate-pulse"
                style={{ height: i % 3 === 0 ? 320 : i % 3 === 1 ? 260 : 380 }}
              />
            ))}
          </div>
        ) : (
          <RevealStagger className="columns-1 sm:columns-2 md:columns-3 gap-4 sm:gap-5 [column-fill:_balance]" stagger={0.05}>
            {items.map((item) => (
              <motion.figure
                key={item.id}
                variants={revealItemVariants}
                className="break-inside-avoid mb-4 sm:mb-5 rounded-xl overflow-hidden bg-muted/30 shadow-sm ring-1 ring-black/[0.04]"
                data-testid={`editorial-gallery-${item.id}`}
              >
                <div
                  className={
                    item.id % 3 === 0
                      ? "aspect-[3/4] min-h-[200px]"
                      : item.id % 3 === 1
                        ? "aspect-[4/5] min-h-[220px]"
                        : "aspect-[5/6] min-h-[240px]"
                  }
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption ?? "Editorial"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </motion.figure>
            ))}
          </RevealStagger>
        )}

        {!isLoading && items.length > 0 && (
          <Reveal className="text-center mt-12">
            <Button variant="outline" asChild className="tracking-[0.2em] uppercase text-xs px-8 border-foreground/20 hover:bg-foreground/5">
              <Link href="/gallery">View gallery</Link>
            </Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
