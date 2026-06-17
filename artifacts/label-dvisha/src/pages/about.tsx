import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { BrandLogo, publicAssetUrl } from "@/components/BrandLogo";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";
import { ReviewsCarousel, type Review } from "@/components/about/ReviewsCarousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const cream = "#F9F5F1";
const valuesBg = "#2D1E17";
const valuesText = "#EDE8E0";

const PAGE_TITLE = "About Label Dvisha | Premium Custom Indian Womenswear from Surat";
const PAGE_DESCRIPTION =
  "Discover Label Dvisha — a premium made-to-order Indian fashion brand from Surat. Handcrafted womenswear, custom tailoring, and slow-fashion craftsmanship rooted in textile heritage.";

const REVIEWS: Review[] = [
  {
    id: "review-1",
    name: "Ananya Mehta",
    location: "Mumbai, Maharashtra",
    rating: 5,
    occasion: "Wedding guest ensemble",
    text: "The fit was flawless and the embroidery felt truly bespoke. Label Dvisha understood exactly what I wanted for the wedding — elegant without being overdone.",
  },
  {
    id: "review-2",
    name: "Riya Shah",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    occasion: "Navratri custom lehenga",
    text: "From fabric selection to final delivery, the team was patient and detail-oriented. My Navratri outfit received compliments all nine nights.",
  },
  {
    id: "review-3",
    name: "Priya Nair",
    location: "Bengaluru, Karnataka",
    rating: 5,
    occasion: "Fusion co-ord set",
    text: "I ordered a custom fusion set for a corporate event and it felt premium in every way — the drape, the finish, the thoughtful tailoring.",
  },
  {
    id: "review-4",
    name: "Kavita Desai",
    location: "Surat, Gujarat",
    rating: 5,
    occasion: "Studio consultation",
    text: "Visiting the Surat studio was a beautiful experience. You can feel the craftsmanship in every thread — slow fashion done right.",
  },
  {
    id: "review-5",
    name: "Meera Kapoor",
    location: "Delhi NCR",
    rating: 5,
    occasion: "Festive saree blouse",
    text: "The made-to-measure blouse fit like it was made for me — because it was. Communication was clear and delivery was on time.",
  },
];

const FOUNDER = {
  name: "DVisha",
  role: "Founder",
  image: publicAssetUrl("founder-dvisha.png"),
  story: [
    "Label DVisha was born from a simple belief: confidence begins with comfort.",
    "After studying fashion and working in the industry, I realized my dream wasn't to build a career for someone else—it was to create a brand of my own. In 2022, I left my job, trusted my vision, and started Label DVisha with a small investment, strong family support, and a passion for designing effortless western wear for women.",
    "Every piece is thoughtfully created to make women feel comfortable, confident, and beautiful in their own skin. For me, fashion has never been about trends—it's about how a woman feels when she wears something she truly loves.",
    "Today, Label DVisha represents timeless style, comfort, and the confidence to be unapologetically yourself.",
  ],
};

function usePageSeo() {
  useEffect(() => {
    document.title = PAGE_TITLE;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", PAGE_DESCRIPTION);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", PAGE_TITLE);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", PAGE_DESCRIPTION);

    const scriptId = "about-page-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Label Dvisha",
      description: PAGE_DESCRIPTION,
      url: typeof window !== "undefined" ? window.location.origin : "",
      logo: publicAssetUrl("logo.png"),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Surat",
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
      sameAs: ["https://instagram.com/labeldvisha"],
    });

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, []);
}

export default function AboutPage() {
  usePageSeo();

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section
        className="relative min-h-[48vh] sm:min-h-[52vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden"
        style={{ backgroundColor: valuesBg }}
      >
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 55% at 50% 35%, hsl(40 30% 92%) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 opacity-[0.06]"
          aria-hidden
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            backgroundImage: `url(${publicAssetUrl("about-atelier.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Reveal className="relative flex flex-col items-center text-center max-w-3xl mx-auto">
          <BrandLogo framed className="mb-8" imgClassName="h-14 sm:h-16 w-auto max-w-[min(280px,80vw)] object-contain" />
          <p className="mb-4 text-[0.65rem] font-sans uppercase tracking-[0.28em] text-[#EDE8E0]/60">
            Premium Custom Indian Womenswear
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F9F6F1] tracking-tight mb-6">
            Crafted with intention. Worn with pride.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#EDE8E0]/80 leading-relaxed max-w-2xl">
            Label Dvisha is a made-to-order fashion house from Surat, India — where heritage textile craftsmanship
            meets modern, minimal design for women who value quality over quantity.
          </p>
        </Reveal>
      </section>

      {/* Our Story */}
      <Reveal y={22}>
        <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: cream }}>
          <motion.div
            className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative order-2 lg:order-1">
              <motion.div
                className="relative overflow-hidden rounded-2xl aspect-[4/5] shadow-[0_32px_64px_-24px_rgba(45,30,23,0.35)]"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={publicAssetUrl("about-atelier.png")}
                  alt="Label Dvisha atelier — artisan embroidery on premium Indian fabric"
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-[#2D1E17]/40 via-transparent to-transparent"
                  aria-hidden
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-5 -right-4 sm:-right-6 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <BrandLogo imgClassName="h-8 w-auto object-contain" />
              </motion.div>
            </div>

            <motion.div className="order-1 lg:order-2" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}>
              <p className="mb-3 text-[0.65rem] font-sans uppercase tracking-[0.24em] text-[#2D1E17]/50">
                Our Story
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-8 tracking-tight">
                Where Surat&apos;s textile legacy meets modern womenswear
              </h2>
              <motion.div className="space-y-5 text-foreground/85 font-sans text-base sm:text-lg leading-relaxed">
                <p>
                  Label Dvisha was born in Surat — India&apos;s textile capital — with a simple belief: every woman
                  deserves clothing that fits her body, her occasion, and her story.
                </p>
                <p>
                  We specialize in premium custom Indian womenswear — from Western silhouettes and fusion ensembles to
                  festive Navratri attire and traditional occasion wear. Each piece is made to order, reducing waste and
                  elevating the slow-fashion experience.
                </p>
                <p>
                  From the first sketch to the final stitch, our studio blends artisanal craftsmanship with
                  contemporary design — creating garments that feel personal, refined, and unmistakably yours.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </Reveal>

      {/* Values */}
      <Reveal y={24}>
        <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: valuesBg, color: valuesText }}>
          <motion.div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 sm:mb-16">
              <p className="mb-3 text-[0.65rem] font-sans uppercase tracking-[0.24em] text-[#EDE8E0]/50">
                What we stand for
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl" style={{ color: valuesText }}>
                Our Values
              </h2>
            </div>
            <RevealStagger className="grid md:grid-cols-3 gap-10 md:gap-8 lg:gap-12" stagger={0.12}>
              {[
                {
                  title: "Craftsmanship",
                  body: "Every garment is meticulously crafted by skilled artisans who pour expertise into every stitch, finish, and detail.",
                },
                {
                  title: "Sustainability",
                  body: "Made-to-order production minimizes waste. We champion slow fashion — pieces designed to last, not trends that fade.",
                },
                {
                  title: "Personalization",
                  body: "Your vision, your measurements, your style. We create pieces uniquely yours, celebrating individuality with precision.",
                },
              ].map((value) => (
                <motion.div
                  key={value.title}
                  variants={revealItemVariants}
                  className="group text-center md:text-left border-t border-[#EDE8E0]/15 pt-8"
                >
                  <motion.div
                    className="mb-5 h-px w-8 bg-[#C4A574] mx-auto md:mx-0"
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                  <h3 className="font-serif text-xl sm:text-2xl mb-4" style={{ color: valuesText }}>
                    {value.title}
                  </h3>
                  <p className="font-sans text-sm sm:text-base leading-relaxed opacity-85">{value.body}</p>
                </motion.div>
              ))}
            </RevealStagger>
          </motion.div>
        </section>
      </Reveal>

      {/* Founder */}
      <Reveal y={22}>
        <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: cream }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 sm:mb-16 max-w-2xl mx-auto">
              <p className="mb-3 text-[0.65rem] font-sans uppercase tracking-[0.24em] text-[#2D1E17]/50">
                The person behind the label
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight mb-4">Founder Story</h2>
              <p className="font-sans text-base text-foreground/70 leading-relaxed">
                Confidence begins with comfort — the belief at the heart of Label DVisha.
              </p>
            </div>

            <motion.div
              className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center rounded-2xl bg-white p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-24px_rgba(45,30,23,0.25)] ring-1 ring-[#2D1E17]/8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div className="relative overflow-hidden rounded-xl aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]">
                <motion.img
                  src={FOUNDER.image}
                  alt={`${FOUNDER.name}, ${FOUNDER.role} at Label Dvisha`}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.7 }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#2D1E17]/25 via-transparent to-transparent"
                  aria-hidden
                />
              </motion.div>

              <div className="flex flex-col justify-center py-2 lg:py-4">
                <p className="mb-3 text-[0.65rem] font-sans uppercase tracking-[0.22em] text-[#2D1E17]/50">
                  {FOUNDER.role}
                </p>
                <div className="space-y-5 font-sans text-base sm:text-lg text-foreground/85 leading-relaxed mb-8">
                  {FOUNDER.story.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
                <p className="font-serif text-lg sm:text-xl text-foreground/90">
                  — {FOUNDER.name}, {FOUNDER.role}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* Reviews */}
      <Reveal y={20}>
        <section id="reviews" className="py-16 sm:py-24 px-4 sm:px-6 scroll-mt-24" style={{ backgroundColor: valuesBg }}>
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-14"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-3 text-[0.65rem] font-sans uppercase tracking-[0.24em] text-[#EDE8E0]/50">
                Client stories
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#F9F6F1] tracking-tight mb-4">
                Loved by women across India
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#EDE8E0]/70 leading-relaxed max-w-xl mx-auto">
                Real experiences from clients who chose Label Dvisha for custom Indian womenswear, festive wear, and
                made-to-measure tailoring.
              </p>
            </motion.div>

            <ReviewsCarousel reviews={REVIEWS} />
          </div>
        </section>
      </Reveal>

      {/* FAQs */}
      <Reveal y={18}>
        <section id="faqs" className="py-16 sm:py-24 px-4 sm:px-6 scroll-mt-24" style={{ backgroundColor: cream }}>
          <motion.div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <p className="mb-3 text-[0.65rem] font-sans uppercase tracking-[0.24em] text-[#2D1E17]/50">
                Common questions
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full border border-border/60 rounded-xl bg-background/80 px-2">
              {[
                {
                  q: "How long does a custom order take?",
                  a: "Most made-to-order pieces ship within 2–4 weeks after your measurements and fabric choices are confirmed. Complex embroidery or peak-season orders may take a little longer — we will always share a realistic timeline before we begin.",
                },
                {
                  q: "Do you ship across India?",
                  a: "Yes. We ship domestically with trusted courier partners. Shipping charges and estimated delivery windows are shown at checkout once you enter your pincode.",
                },
                {
                  q: "Can I visit the studio in Surat?",
                  a: "Absolutely. We welcome consultations by appointment so we can give you our full attention. Use the contact page to share your preferred dates and we will coordinate a visit.",
                },
                {
                  q: "How do I choose the right size?",
                  a: "Refer to our measurement guide on product pages for a quick walkthrough. When in doubt, share your measurements with us after placing an order — our team can guide you before production starts.",
                },
                {
                  q: "What is your approach to alterations or fit issues?",
                  a: "We want you to love the fit. If something is not right, reach out within a few days of delivery with photos and details. We will assess each case individually and advise on alterations or next steps.",
                },
              ].map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-b border-border/50 last:border-0 px-2">
                  <AccordionTrigger className="text-left font-sans text-sm sm:text-base hover:no-underline py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pt-0">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>
      </Reveal>

      {/* Location + CTA */}
      <Reveal y={16}>
        <section className="py-16 sm:py-24 px-4 sm:px-6 pb-28" style={{ backgroundColor: cream }}>
          <motion.div
            className="max-w-4xl mx-auto text-center rounded-2xl px-6 py-14 sm:px-12 sm:py-16 ring-1 ring-[#2D1E17]/10"
            style={{ backgroundColor: valuesBg }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <BrandLogo framed className="mb-8 mx-auto" imgClassName="h-10 sm:h-11 w-auto object-contain" />
            <h2 className="font-serif text-3xl sm:text-4xl text-[#F9F6F1] mb-5 tracking-tight">
              Based in Surat, India
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#EDE8E0]/85 leading-relaxed max-w-2xl mx-auto mb-10">
              Our studio is nestled in Surat — a city where centuries of textile heritage meet modern innovation. Every
              Label Dvisha creation carries that legacy forward.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/custom-order"
                className="inline-flex items-center justify-center rounded-full bg-[#F9F5F1] px-8 py-3 font-sans text-sm font-medium text-[#2D1E17] transition-opacity hover:opacity-90"
              >
                Start a Custom Order
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#EDE8E0]/30 px-8 py-3 font-sans text-sm font-medium text-[#EDE8E0] transition-colors hover:bg-[#EDE8E0]/10"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </section>
      </Reveal>
    </StorefrontLayout>
  );
}
