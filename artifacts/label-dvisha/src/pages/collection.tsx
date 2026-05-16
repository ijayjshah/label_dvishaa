import { useMemo } from "react";
import { Link, useParams, useSearch } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";
import {
  useGetCategoryBySlug,
  getGetCategoryBySlugQueryKey,
  useListProducts,
  getListProductsQueryKey,
} from "@workspace/api-client-react";

export default function CollectionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const search = useSearch();
  const subSlug = useMemo(() => new URLSearchParams(search).get("sub") ?? "", [search]);

  const { data: bundle, isLoading: bundleLoading, isError } = useGetCategoryBySlug(slug, {
    query: {
      queryKey: getGetCategoryBySlugQueryKey(slug),
      enabled: Boolean(slug),
    },
  });

  const category = bundle?.category;
  const children = bundle?.children ?? [];
  const isParent = children.length > 0;
  const activeSub = useMemo(
    () => (subSlug ? children.find((c) => c.slug === subSlug) : undefined),
    [children, subSlug],
  );

  const listParams = useMemo(() => {
    if (!category) return undefined;
    if (isParent) {
      return {
        categoryParentId: category.id,
        categoryId: activeSub?.id,
        limit: 24,
        page: 1,
      };
    }
    return { categoryId: category.id, limit: 24, page: 1 };
  }, [category, isParent, activeSub]);

  const { data: productsData, isLoading: productsLoading } = useListProducts(listParams, {
    query: {
      enabled: Boolean(category && listParams),
      queryKey: getListProductsQueryKey(listParams),
    },
  });

  const products = productsData?.data ?? [];
  const total = productsData?.total ?? 0;
  const reduceMotion = useReducedMotion();

  if (bundleLoading) {
    return (
      <StorefrontLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center text-muted-foreground">Loading collection…</div>
      </StorefrontLayout>
    );
  }

  if (isError || !category) {
    return (
      <StorefrontLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="font-serif text-2xl mb-4">Collection not found</p>
          <Link href="/products" className="text-sm underline underline-offset-4">
            View all pieces
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  const heroImage = category.imageUrl;

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative min-h-[42vh] sm:min-h-[48vh] flex items-center justify-center overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#2D1E17] via-[#3d2a22] to-[#2D1E17]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center">
          {reduceMotion ? (
            <>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F9F6F1] tracking-tight mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-[#EDE8E0]/95 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">{category.description}</p>
              )}
            </>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } } }}
            >
              <motion.h1 variants={revealItemVariants} className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F9F6F1] tracking-tight mb-4">
                {category.name}
              </motion.h1>
              {category.description && (
                <motion.p variants={revealItemVariants} className="text-[#EDE8E0]/95 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                  {category.description}
                </motion.p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Reveal className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" y={14}>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <p className="text-sm text-muted-foreground sm:text-right">{total} {total === 1 ? "item" : "items"}</p>
        </Reveal>

        {isParent && (
          <Reveal className="mb-8 flex flex-wrap gap-2" y={12} delay={0.05}>
            <Link
              href={`/collections/${slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                !subSlug ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/60"
              }`}
            >
              All
            </Link>
            {children.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${slug}?sub=${encodeURIComponent(c.slug)}`}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  subSlug === c.slug ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/60"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </Reveal>
        )}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-10" aria-hidden />

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-3" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No pieces in this collection yet.</p>
        ) : (
          <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" stagger={0.05}>
            {products.map((product) => (
              <motion.div key={product.id} variants={revealItemVariants}>
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="aspect-[3/4] bg-muted overflow-hidden mb-3 rounded-sm">
                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-sm mt-1">₹{product.price.toLocaleString("en-IN")}</p>
                </Link>
              </motion.div>
            ))}
          </RevealStagger>
        )}
      </div>
    </StorefrontLayout>
  );
}
