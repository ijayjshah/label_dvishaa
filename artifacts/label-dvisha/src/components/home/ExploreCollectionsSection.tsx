import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Category } from "@workspace/api-client-react";
import { RevealStagger, revealItemVariants } from "@/components/motion";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { imageHoverZoom, sectionPadding, sectionBorder } from "./theme";

type ExploreCollectionsSectionProps = {
  categories: Category[];
};

export function ExploreCollectionsSection({ categories }: ExploreCollectionsSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section
      id="explore-collections"
      className={cn(sectionPadding, "bg-background scroll-mt-20", sectionBorder)}
    >
      <div className="max-w-[90rem] mx-auto w-full min-w-0">
        <SectionHeader
          eyebrow="Browse by"
          title="Collections"
          align="center"
          backgroundText="Edit"
          className="mb-8 sm:mb-12 lg:mb-16"
        />

        <RevealStagger
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          stagger={0.06}
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={revealItemVariants} className="min-w-0">
              <CollectionCard cat={cat} />
            </motion.div>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function CollectionCard({ cat }: { cat: Category }) {
  return (
    <Link
      href={`/collections/${cat.slug}`}
      className="group block min-w-0"
      data-testid={`link-category-${cat.id}`}
    >
      <div className="overflow-hidden rounded-sm bg-[#F9F6F1] border border-[#E8E2D9] hover:border-[#C4A574]/50 transition-colors duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
          {cat.imageUrl ? (
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className={cn("absolute inset-0 w-full h-full object-cover", imageHoverZoom)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <span className="font-serif text-sm sm:text-base text-center text-muted-foreground/50 line-clamp-2">
                {cat.name}
              </span>
            </div>
          )}
        </div>
        <div className="px-2.5 py-2.5 sm:px-3 sm:py-3 md:px-4 md:py-3.5 text-center">
          <h3 className="font-serif text-sm sm:text-base md:text-lg font-normal text-foreground tracking-[-0.02em] line-clamp-2">
            {cat.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
