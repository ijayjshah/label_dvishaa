import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Product } from "@workspace/api-client-react";
import { RevealStagger, revealItemVariants } from "@/components/motion";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { imageHoverZoom, sectionPadding } from "./theme";

type ExploreProductsSectionProps = {
  products: Product[];
};

/** Bento grid cell spans — editorial mixed sizing for up to 8 products. */
function getBentoClass(index: number, total: number): string {
  if (total <= 4) {
    return index === 0 ? "md:col-span-2 md:row-span-2" : "";
  }
  switch (index) {
    case 0:
      return "md:col-span-2 md:row-span-2";
    case 3:
      return "md:row-span-2";
    case 5:
      return "lg:col-span-2";
    default:
      return "";
  }
}

export function ExploreProductsSection({ products }: ExploreProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section id="explore-products" className={cn(sectionPadding, "bg-background scroll-mt-20 relative")}>
      <div className="max-w-[90rem] mx-auto relative">
        <SectionHeader
          eyebrow="Curated for you"
          title="Featured Pieces"
          href="/products"
          linkLabel="View all"
          backgroundText="Pieces"
          className="mb-12 sm:mb-16 lg:mb-20"
        />

        <RevealStagger
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 md:auto-rows-[minmax(180px,auto)]"
          stagger={0.07}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={revealItemVariants}
              className={cn(getBentoClass(index, products.length))}
            >
              <ProductCard product={product} featured={index === 0} />
            </motion.div>
          ))}
        </RevealStagger>

        <div className="mt-14 text-center sm:hidden">
          <Link
            href="/products"
            className="text-[10px] font-sans tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, featured }: { product: Product; featured?: boolean }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block h-full"
      data-testid={`card-product-${product.id}`}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted/30 aspect-[3/4] md:aspect-auto md:h-full",
          featured ? "md:min-h-[360px]" : "md:min-h-[260px]",
        )}
      >
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.name}
            className={cn("absolute inset-0 w-full h-full object-cover", imageHoverZoom)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-[10px] tracking-[0.2em] uppercase">
            —
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/[0.03] transition-colors duration-500 pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
          <p
            className={cn(
              "font-sans font-light text-white line-clamp-2 sm:line-clamp-1 mb-0.5 sm:mb-1",
              featured ? "text-xs sm:text-sm md:text-base" : "text-[11px] sm:text-xs md:text-sm",
            )}
          >
            {product.name}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-xs sm:text-sm font-sans text-white/90">₹{product.price.toLocaleString("en-IN")}</p>
            {product.compareAtPrice && (
              <p className="text-[10px] sm:text-xs font-light text-white/50 line-through">
                ₹{product.compareAtPrice.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
