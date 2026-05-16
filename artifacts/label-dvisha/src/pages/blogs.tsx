import { Link } from "wouter";
import { motion } from "framer-motion";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListBlogPosts, getListBlogPostsQueryKey } from "@workspace/api-client-react";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";

export default function BlogsPage() {
  const { data, isLoading } = useListBlogPosts(
    { page: 1, limit: 24 },
    { query: { queryKey: getListBlogPostsQueryKey({ page: 1, limit: 24 }) } },
  );

  const posts = data?.data ?? [];

  return (
    <StorefrontLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <Reveal className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">Journal</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Stories from the studio — craftsmanship, styling ideas, and behind the scenes at Label Dvisha.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">New posts are coming soon.</p>
        ) : (
          <RevealStagger className="space-y-10" stagger={0.08}>
            {posts.map((post) => (
              <motion.article
                key={post.id}
                variants={revealItemVariants}
                className="border-b border-border/70 pb-10 last:border-0"
              >
                <Link href={`/blogs/${post.slug}`} className="group block">
                  {post.featuredImageUrl && (
                    <div className="aspect-[21/9] overflow-hidden rounded-lg mb-4 bg-muted">
                      <img
                        src={post.featuredImageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h2 className="font-serif text-2xl text-foreground group-hover:underline underline-offset-4 decoration-foreground/30">
                    {post.title}
                  </h2>
                  {post.excerpt && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>}
                  <p className="mt-3 text-xs tracking-widest uppercase text-muted-foreground">Read more</p>
                </Link>
              </motion.article>
            ))}
          </RevealStagger>
        )}
      </div>
    </StorefrontLayout>
  );
}
