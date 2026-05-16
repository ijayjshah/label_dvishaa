import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";

export default function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCategoryId = params.get("categoryId") ? Number(params.get("categoryId")) : undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategoryId);
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useListCategories();
  const { data, isLoading } = useListProducts({
    categoryId: selectedCategory,
    search: searchQuery || undefined,
    page,
    limit: 16,
  });

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const categories = (categoriesData ?? []).filter(c => c.isActive);
  const roots = useMemo(
    () => categories.filter((c) => c.parentId == null).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const subsByParent = useMemo(() => {
    const m = new Map<number, (typeof categories)[number][]>();
    for (const c of categories) {
      if (c.parentId == null) continue;
      const list = m.get(c.parentId) ?? [];
      list.push(c);
      m.set(c.parentId, list);
    }
    for (const [, list] of m) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return m;
  }, [categories]);
  const totalPages = Math.ceil(total / 16);

  function handleCategoryChange(id: number | undefined) {
    setSelectedCategory(id);
    setPage(1);
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Reveal className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl mb-2">Collections</h1>
          <p className="text-sm text-muted-foreground">{total} pieces</p>
        </Reveal>

        <div className="flex flex-col sm:flex-row gap-8">
          <aside className="sm:w-48 flex-shrink-0">
            <Reveal className="block" y={20}>
              <div className="sticky top-20">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search..."
                  className="pl-9 text-sm"
                  data-testid="input-search"
                />
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Category</p>
                <button
                  className={`block text-sm mb-2 transition-colors ${!selectedCategory ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => handleCategoryChange(undefined)}
                  data-testid="button-category-all"
                >
                  All
                </button>
                {roots.map((root) => {
                  const subs = subsByParent.get(root.id) ?? [];
                  return (
                    <div key={root.id} className="mb-4">
                      <Link
                        href={`/collections/${root.slug}`}
                        className="block text-sm font-medium text-foreground hover:underline underline-offset-4 mb-1.5"
                      >
                        {root.name}
                      </Link>
                      {subs.length > 0 ? (
                        <div className="pl-2 border-l border-border/80 space-y-1.5 mt-1">
                          {subs.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              className={`block text-left text-xs w-full transition-colors ${
                                selectedCategory === sub.id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={() => handleCategoryChange(sub.id)}
                              data-testid={`button-category-${sub.id}`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`block text-xs mt-1 transition-colors ${
                            selectedCategory === root.id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => handleCategoryChange(root.id)}
                          data-testid={`button-category-${root.id}`}
                        >
                          Shop this collection
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </Reveal>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-muted mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="font-serif text-xl mb-2">No pieces found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" stagger={0.05}>
                  {products.map(product => (
                    <motion.div key={product.id} variants={revealItemVariants}>
                      <Link
                        href={`/products/${product.id}`}
                        className="group block"
                        data-testid={`card-product-${product.id}`}
                      >
                        <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
                          {product.primaryImage ? (
                            <img
                              src={product.primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm">₹{product.price.toLocaleString("en-IN")}</p>
                          {product.compareAtPrice && (
                            <p className="text-xs text-muted-foreground line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</p>
                          )}
                        </div>
                        {product.category && (
                          <p className="text-xs text-muted-foreground mt-0.5">{product.category.name}</p>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </RevealStagger>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
