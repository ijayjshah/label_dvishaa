import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { CustomOrderHomeSection } from "@/components/home/CustomOrderHomeSection";
import { EditorialSection } from "@/components/home/EditorialSection";
import { ExploreCollectionsSection } from "@/components/home/ExploreCollectionsSection";
import { ExploreProductsSection } from "@/components/home/ExploreProductsSection";
import { HeroSlider } from "@/components/home/HeroSlider";
import { PremiumMarquee } from "@/components/home/PremiumMarquee";
import { PromoBannerSection } from "@/components/home/PromoBannerSection";
import { Reveal, motionEase } from "@/components/motion";
import { useListBanners, useListProducts, useListCategories } from "@workspace/api-client-react";

export default function Home() {
  const { data: banners } = useListBanners();
  const { data: featuredData } = useListProducts({ featured: true, limit: 8 });
  const { data: categories } = useListCategories();
  const featured = featuredData?.data ?? [];
  const allCategories = (categories ?? []).filter((c) => c.isActive);
  const rootCategories = allCategories.filter((c) => c.parentId == null).slice(0, 6);
  const heroBanners = (banners ?? []).filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const promoBanner = heroBanners.length > 1 ? heroBanners[1] : banners?.[1];

  return (
    <StorefrontLayout>
      <HeroSlider banners={heroBanners} />

      <ExploreProductsSection products={featured} />

      <ExploreCollectionsSection categories={rootCategories} />

      <PremiumMarquee />

      <CustomOrderHomeSection />

      {promoBanner && <PromoBannerSection banner={promoBanner} />}

      <Reveal y={18}>
        <section
          id="about"
          className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 md:px-8 bg-primary text-primary-foreground text-center scroll-mt-20"
        >
          <div className="max-w-3xl mx-auto">
            <motion.p
              className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal tracking-[-0.02em] leading-[1.2] text-primary-foreground mb-3 sm:mb-4 md:mb-5 px-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: motionEase }}
            >
              Every thread tells a story.
            </motion.p>
            <motion.p
              className="font-sans text-sm sm:text-[15px] font-light text-primary-foreground/70 tracking-wide"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.12, ease: motionEase }}
            >
              Handcrafted womenswear, made in India.
            </motion.p>
          </div>
        </section>
      </Reveal>

      <EditorialSection />
    </StorefrontLayout>
  );
}
