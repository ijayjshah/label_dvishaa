import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useGetBlogPostBySlug, getGetBlogPostBySlugQueryKey } from "@workspace/api-client-react";
import { Reveal } from "@/components/motion";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: post, isLoading, isError } = useGetBlogPostBySlug(slug, {
    query: {
      queryKey: getGetBlogPostBySlugQueryKey(slug),
      enabled: Boolean(slug),
    },
  });

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-muted-foreground text-center">Loading…</div>
      </StorefrontLayout>
    );
  }

  if (isError || !post) {
    return (
      <StorefrontLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="font-serif text-2xl mb-4">Post not found</p>
          <Link href="/blogs" className="text-sm underline underline-offset-4">
            Back to journal
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Reveal>
          <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Journal
          </Link>
        </Reveal>
        {post.featuredImageUrl && (
          <Reveal y={20} delay={0.05}>
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-muted mb-8">
              <img src={post.featuredImageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        )}
        <Reveal y={22} delay={post.featuredImageUrl ? 0.08 : 0}>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground tracking-tight mb-6">{post.title}</h1>
        </Reveal>
        {post.excerpt && (
          <Reveal y={18} delay={0.1}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">{post.excerpt}</p>
          </Reveal>
        )}
        <Reveal y={16} delay={0.12}>
          <div className="prose prose-neutral dark:prose-invert max-w-none font-sans text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {post.body}
          </div>
        </Reveal>
      </article>
    </StorefrontLayout>
  );
}
