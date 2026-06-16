import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListGallery } from "@workspace/api-client-react";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { brandWarmWhite, imageHoverZoom, sectionPadding, sectionBorder } from "./theme";

/** Editorial gallery grid (admin-managed). */
export function EditorialSection() {
  const { data, isLoading } = useListGallery({ page: 1 });
  const items = data?.data?.slice(0, 9) ?? [];

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(sectionPadding, sectionBorder)}
      style={{ backgroundColor: brandWarmWhite }}
      aria-labelledby="editorial-heading"
    >
      <div className="max-w-[90rem] mx-auto w-full min-w-0">
        <SectionHeader
          title="Editorial"
          description="Stories told through fabric and form"
          href="/gallery"
          linkLabel="View gallery"
          align="center"
          backgroundText="Edit"
          className="mb-8 sm:mb-12 md:mb-16"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted/40 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <RevealStagger
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            stagger={0.06}
          >
            {items.map((item) => (
              <motion.figure
                key={item.id}
                variants={revealItemVariants}
                className="group overflow-hidden bg-muted/20 relative min-w-0"
                data-testid={`editorial-gallery-${item.id}`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.caption ?? "Editorial"}
                    className={cn("w-full h-full object-cover", imageHoverZoom)}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {item.caption && (
                  <figcaption className="p-3 sm:p-4 bg-[#F5F5F5] border border-t-0 border-[#E8E2D9]">
                    <p className="text-xs sm:text-sm font-sans text-foreground line-clamp-2">{item.caption}</p>
                  </figcaption>
                )}
              </motion.figure>
            ))}
          </RevealStagger>
        )}

        {!isLoading && items.length > 0 && (
          <Reveal className="text-center mt-10 sm:mt-14 md:mt-16">
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center min-h-[44px] px-6 sm:px-8 py-3 rounded-full border border-border/60 text-[10px] font-sans tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/30 transition-all duration-400"
            >
              View gallery
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
