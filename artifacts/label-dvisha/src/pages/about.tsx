import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

const cream = "#F9F5F1";
const valuesBg = "#2D1E17";
const valuesText = "#EDE8E0";

export default function AboutPage() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <section
        className="relative min-h-[38vh] sm:min-h-[42vh] flex items-center justify-center px-6 py-20"
        style={{
          background:
            "linear-gradient(160deg, hsl(25 12% 38%) 0%, hsl(25 15% 28%) 45%, hsl(25 18% 22%) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(40 30% 92%) 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <h1 className="relative font-serif text-4xl sm:text-5xl md:text-6xl text-[#F9F6F1] text-center tracking-tight max-w-4xl">
          About Label Dvisha
        </h1>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 px-4 sm:px-6" style={{ backgroundColor: cream }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground text-center mb-10 sm:mb-12">
            Our Story
          </h2>
          <div className="space-y-6 text-foreground/90 font-sans text-base sm:text-lg leading-relaxed">
            <p>
              Label Dvisha is a premium custom clothing brand rooted in the heart of Surat, India — a city renowned for
              its rich textile heritage and artisanal craftsmanship.
            </p>
            <p>
              Founded with a vision to blend timeless elegance with contemporary design, we create garments that feel
              personal, refined, and made for real life. From sketch to stitch, we focus on quality over quantity and
              take pride in every detail.
            </p>
            <p>
              From concept through production we embrace a made-to-order philosophy, where every stitch is a testament
              to quality, sustainability, and attention to detail.
            </p>
            <p>
              From Western silhouettes to festive masterpieces, from fusion ensembles to traditional Navratri attire, we
              curate collections that honor India&apos;s diverse cultural tapestry while embracing global trends.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-20 px-4 sm:px-6" style={{ backgroundColor: valuesBg, color: valuesText }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl text-center mb-12 sm:mb-14" style={{ color: valuesText }}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl sm:text-2xl mb-4" style={{ color: valuesText }}>
                Craftsmanship
              </h3>
              <p className="font-sans text-sm sm:text-base leading-relaxed opacity-90">
                Every garment is a work of art, meticulously crafted by skilled artisans who pour their expertise into
                every stitch.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl sm:text-2xl mb-4" style={{ color: valuesText }}>
                Sustainability
              </h3>
              <p className="font-sans text-sm sm:text-base leading-relaxed opacity-90">
                We embrace made-to-order production to minimize waste and champion slow fashion over fast trends.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl sm:text-2xl mb-4" style={{ color: valuesText }}>
                Personalization
              </h3>
              <p className="font-sans text-sm sm:text-base leading-relaxed opacity-90">
                Your vision, your measurements, your style. We create pieces that are uniquely yours, celebrating your
                individuality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Based in Surat */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 pb-24" style={{ backgroundColor: cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-8">Based in Surat, India</h2>
          <p className="font-sans text-base sm:text-lg text-foreground/90 leading-relaxed">
            Our studio is nestled in Surat, a city that has been the textile capital of India for centuries. Here,
            tradition meets innovation, and every creation is infused with the city&apos;s legendary craftsmanship.
          </p>
        </div>
      </section>
    </StorefrontLayout>
  );
}
