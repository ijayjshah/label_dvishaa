import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListGallery } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";

export default function GalleryPage() {
  const { data, isLoading } = useListGallery({ page: 1 });
  const items = data?.data ?? [];

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Reveal className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Our community</p>
          <h1 className="font-serif text-3xl sm:text-4xl">Lookbook</h1>
        </Reveal>

        {isLoading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3 aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-serif text-2xl mb-2">Gallery is empty</p>
            <p className="text-sm">New looks will appear here soon.</p>
          </div>
        ) : (
          <RevealStagger className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3" stagger={0.04}>
            {items.map((item) => (
              <motion.div key={item.id} variants={revealItemVariants} className="break-inside-avoid">
                <div
                  className="group relative overflow-hidden"
                  data-testid={`img-gallery-${item.id}`}
                >
                  <img src={item.imageUrl} alt={item.caption ?? "Gallery"} className="w-full object-cover" />
                  {(item.caption || item.userName) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.caption && (
                        <p className="text-white text-sm line-clamp-2">{item.caption}</p>
                      )}
                      {item.userName && (
                        <p className="text-white/70 text-xs mt-0.5">{item.userName}</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </RevealStagger>
        )}
      </div>
    </StorefrontLayout>
  );
}
