import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Search } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const totalPages = Math.ceil(total / 16);

  function handleCategoryChange(id: number | undefined) {
    setSelectedCategory(id);
    setPage(1);
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl mb-2">Collections</h1>
          <p className="text-sm text-muted-foreground">{total} pieces</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="sm:w-48 flex-shrink-0">
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
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`block text-sm mb-2 transition-colors ${selectedCategory === cat.id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => handleCategoryChange(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map(product => (
                    <Link
                      key={product.id}
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
                  ))}
                </div>

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
