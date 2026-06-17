import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Reveal, RevealStagger, revealItemVariants } from "@/components/motion";
import { useListSettings, useCreateContactMessage } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";

const BG = "#F9F5F1";
const cardBg = "#FFFFFF";
const accentBox = "#EDE8E0";
const studioCard = "#2D1E17";
const studioText = "#EDE8E0";

const formSchema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please write at least a few words"),
});
type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const { data: settings } = useListSettings();
  const { user } = useAuth();
  const { toast } = useToast();

  const byKey = useMemo(() => {
    const m: Record<string, string> = {};
    (settings ?? []).forEach((s) => {
      m[s.key] = s.value;
    });
    return m;
  }, [settings]);

  const displayPhone = byKey.store_phone || "+91 79904 14960";
  const displayEmail = byKey.store_email || "Labeldvisha4345@gmail.com";
  const displayAddress =
    byKey.store_address ||
    "Sukan Residency Nr, TGB Circle Opp Saurabh Society, Behind Saurabh Police Chowky, Pal Adajan Gam, Surat 395009";
  const instagramUrl = byKey.instagram_url || "https://instagram.com/labeldvisha";
  const instagramHandle = byKey.instagram_handle?.trim() || "@labeldvisha";

  const createMutation = useCreateContactMessage({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Message sent",
          description: "Thank you — we will get back to you shortly.",
        });
        reset({
          fullName: user?.fullName ?? "",
          email: user?.email ?? "",
          phone: "",
          message: "",
        });
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Could not send your message";
        toast({ title: msg, variant: "destructive" });
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? "",
        message: "",
      });
    }
  }, [user, reset]);

  function onSubmit(values: FormValues) {
    createMutation.mutate({
      data: {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        message: values.message.trim(),
      },
    });
  }

  const iconWrap = "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D4C4B0]/50 text-[#2D1E17]";

  return (
    <StorefrontLayout>
      <div id="contact" className="min-h-[calc(100vh-4rem)] font-sans scroll-mt-20" style={{ backgroundColor: BG }}>
        <Reveal>
          <section className="pt-12 sm:pt-16 pb-10 px-4 sm:px-6 text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground tracking-tight mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Have a question or want to start your custom order? We&apos;d love to hear from you.
            </p>
          </section>
        </Reveal>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Form */}
          <Reveal y={20}>
          <div
            className="rounded-2xl border border-border/60 shadow-sm p-6 sm:p-8"
            style={{ backgroundColor: cardBg }}
          >
            <h2 className="font-serif text-2xl text-foreground mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Name</Label>
                <Input id="fullName" placeholder="Your name" {...register("fullName")} className="rounded-lg" />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" {...register("email")} className="rounded-lg" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" {...register("phone")} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us about your project or inquiry..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("message")}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-[#2D1E17] text-[#F9F6F1] hover:bg-[#2D1E17]/90 h-11 tracking-wide"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </div>
          </Reveal>

          {/* Sidebar */}
          <Reveal y={20} delay={0.1}>
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-5">Contact Information</h2>
              <RevealStagger className="space-y-5" stagger={0.07}>
                <motion.div variants={revealItemVariants} className="flex gap-4">
                  <div className={iconWrap}>
                    <Mail className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
                    <a href={`mailto:${displayEmail}`} className="text-sm text-foreground hover:underline">
                      {displayEmail}
                    </a>
                  </div>
                </motion.div>
                <motion.div variants={revealItemVariants} className="flex gap-4">
                  <div className={iconWrap}>
                    <Phone className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Phone</p>
                    <a href={`tel:${displayPhone.replace(/\s/g, "")}`} className="text-sm text-foreground hover:underline">
                      {displayPhone}
                    </a>
                  </div>
                </motion.div>
                <motion.div variants={revealItemVariants} className="flex gap-4">
                  <div className={iconWrap}>
                    <Instagram className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Instagram</p>
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:underline">
                      {instagramHandle}
                    </a>
                  </div>
                </motion.div>
                <motion.div variants={revealItemVariants} className="flex gap-4">
                  <div className={iconWrap}>
                    <MapPin className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Location</p>
                    <p className="text-sm text-foreground">{displayAddress}</p>
                  </div>
                </motion.div>
              </RevealStagger>
            </div>

            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{ backgroundColor: studioCard, color: studioText }}
            >
              <h3 className="font-serif text-xl mb-3" style={{ color: studioText }}>
                Studio Hours
              </h3>
              <p className="text-sm leading-relaxed opacity-95">
                Monday - Saturday: 10:00 AM - 7:00 PM
                <br />
                Sunday: By appointment only
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 p-6 sm:p-7" style={{ backgroundColor: accentBox }}>
              <h3 className="font-serif text-xl text-foreground mb-3">Visit Our Studio</h3>
              <p className="text-sm text-foreground/85 leading-relaxed">
                We welcome you to visit our studio for personal consultations and to experience our fabrics and
                craftsmanship firsthand. Please schedule an appointment in advance.
              </p>
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </StorefrontLayout>
  );
}
