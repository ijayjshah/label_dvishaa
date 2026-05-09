import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListBanners, useListProducts, useListCategories, useListGallery } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: banners } = useListBanners();
  const { data: featuredData } = useListProducts({ featured: true, limit: 8 });
  const { data: categories } = useListCategories();
  const { data: gallery } = useListGallery({ approved: true, page: 1 });

  const featured = featuredData?.data ?? [];
  const allCategories = (categories ?? []).filter(c => c.isActive).slice(0, 6);
  const galleryItems = gallery?.data?.slice(0, 6) ?? [];

  const heroBanner = banners?.[0];

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground min-h-[70vh] flex items-center">
        {heroBanner?.imageUrl ? (
          <img src={heroBanner.imageUrl} alt={heroBanner.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 30% 60%, hsl(40 60% 80%) 0%, transparent 70%)" }} />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 opacity-70">New Collection</p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl mb-6 leading-tight">
            {heroBanner?.title ?? "Wear Your Story"}
          </h1>
          {heroBanner?.subtitle && (
            <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">{heroBanner.subtitle}</p>
          )}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary tracking-widest uppercase text-xs"
          >
            <Link href={heroBanner?.linkUrl ?? "/products"}>
              Explore Collections <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      {allCategories.length > 0 && (
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Browse by</p>
            <h2 className="font-serif text-3xl">Collections</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group relative overflow-hidden bg-muted aspect-[4/3] flex items-end p-4"
                data-testid={`link-category-${cat.id}`}
              >
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="relative z-10 font-serif text-white text-lg">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Curated for you</p>
              <h2 className="font-serif text-3xl">Featured Pieces</h2>
            </div>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors hidden sm:block">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10 sm:hidden">
            <Button variant="outline" asChild className="tracking-widest uppercase text-xs">
              <Link href="/products">View All</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Banner strip */}
      {banners && banners.length > 1 && (
        <section className="py-12 bg-secondary">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">{banners[1].subtitle ?? "Special"}</p>
            <h2 className="font-serif text-3xl mb-4">{banners[1].title}</h2>
            {banners[1].linkUrl && (
              <Button asChild variant="default" className="tracking-widest uppercase text-xs">
                <Link href={banners[1].linkUrl}>Shop Now</Link>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Gallery section */}
      {galleryItems.length > 0 && (
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Our community</p>
            <h2 className="font-serif text-3xl">Lookbook</h2>
          </div>
          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {galleryItems.map(item => (
              <div key={item.id} className="break-inside-avoid" data-testid={`img-gallery-${item.id}`}>
                <img src={item.imageUrl} alt={item.caption ?? "Gallery"} className="w-full object-cover" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" asChild className="tracking-widest uppercase text-xs">
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Brand tagline */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <p className="font-serif text-3xl sm:text-4xl mb-4">Every thread tells a story.</p>
        <p className="text-sm opacity-70 tracking-wider">Handcrafted womenswear, made in India.</p>
      </section>
    </StorefrontLayout>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`} className="group block" data-testid={`card-product-${product.id}`}>
      <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs tracking-widest uppercase">No image</div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-foreground font-medium">₹{product.price.toLocaleString("en-IN")}</p>
          {product.compareAtPrice && (
            <p className="text-xs text-muted-foreground line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
