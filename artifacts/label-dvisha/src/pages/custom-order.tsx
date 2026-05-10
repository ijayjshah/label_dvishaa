import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useListCategories, useCreateCustomOrderRequest } from "@workspace/api-client-react";
import { uploadCustomOrderInspirationToCloudinary } from "@/lib/cloudinary-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  "Upload Inspiration",
  "Select Category",
  "Measurements",
  "Color Selection",
  "Review & Add",
] as const;

const BG = "#F9F7F2";

type WizardState = {
  inspirationFile: File | null;
  inspirationPreview: string | null;
  description: string;
  categoryId: number | null;
  bust: string;
  waist: string;
  hip: string;
  height: string;
  colors: string;
};

const initialState = (): WizardState => ({
  inspirationFile: null,
  inspirationPreview: null,
  description: "",
  categoryId: null,
  bust: "",
  waist: "",
  hip: "",
  height: "",
  colors: "",
});

export default function CustomOrderPage() {
  const { data: categories } = useListCategories();
  const activeCats = useMemo(() => (categories ?? []).filter((c) => c.isActive), [categories]);
  const { toast } = useToast();

  const createRequest = useCreateCustomOrderRequest({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Request received",
          description: "Thank you! Our team will reach out shortly to discuss your custom piece.",
        });
        setStep(0);
        setData(initialState());
      },
    },
  });

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardState>(initialState);

  useEffect(() => {
    return () => {
      if (data.inspirationPreview) URL.revokeObjectURL(data.inspirationPreview);
    };
  }, [data.inspirationPreview]);

  function setFile(file: File | null) {
    if (data.inspirationPreview) URL.revokeObjectURL(data.inspirationPreview);
    if (!file) {
      setData((d) => ({ ...d, inspirationFile: null, inspirationPreview: null }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be 10 MB or smaller", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);
    setData((d) => ({ ...d, inspirationFile: file, inspirationPreview: url }));
  }

  function canGoNext(): boolean {
    switch (step) {
      case 0:
        return Boolean(data.inspirationFile || data.description.trim());
      case 1:
        return data.categoryId != null || activeCats.length === 0;
      case 2:
        return [data.bust, data.waist, data.hip, data.height].some((s) => s.trim() !== "");
      case 3:
        return data.colors.trim() !== "";
      default:
        return true;
    }
  }

  function next() {
    if (step < STEPS.length - 1) {
      if (!canGoNext()) {
        toast({ title: "Please complete this step", variant: "destructive" });
        return;
      }
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submit() {
    if (createRequest.isPending) return;
    try {
      let inspirationImageUrl: string | undefined;
      let inspirationCloudinaryPublicId: string | undefined;
      if (data.inspirationFile) {
        const up = await uploadCustomOrderInspirationToCloudinary(data.inspirationFile);
        inspirationImageUrl = up.imageUrl;
        inspirationCloudinaryPublicId = up.cloudinaryPublicId;
      }
      await createRequest.mutateAsync({
        data: {
          inspirationImageUrl,
          inspirationCloudinaryPublicId,
          description: data.description.trim() || undefined,
          categoryId: data.categoryId ?? undefined,
          bust: data.bust.trim() || undefined,
          waist: data.waist.trim() || undefined,
          hip: data.hip.trim() || undefined,
          height: data.height.trim() || undefined,
          colors: data.colors.trim() || undefined,
        },
      });
      if (data.inspirationPreview) URL.revokeObjectURL(data.inspirationPreview);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not submit your request";
      toast({ title: msg, variant: "destructive" });
    }
  }

  return (
    <StorefrontLayout>
      <div className="min-h-[calc(100vh-4rem)] font-sans" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          {/* Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </p>
              <p className="text-sm font-medium font-sans text-foreground hidden sm:block">{STEPS[step]}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shrink-0 transition-colors ${
                      i === step
                        ? "bg-[#2D1E17] text-white"
                        : i < step
                          ? "bg-[#2D1E17]/80 text-white"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                    title={label}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 min-w-[4px] rounded-full ${i < step ? "bg-[#2D1E17]/45" : "bg-border"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium font-sans text-foreground sm:hidden mt-3">{STEPS[step]}</p>
          </div>

          <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 sm:p-8">
            {step === 0 && (
              <StepUpload data={data} setData={setData} setFile={setFile} />
            )}
            {step === 1 && (
              <StepCategory activeCats={activeCats} data={data} setData={setData} />
            )}
            {step === 2 && <StepMeasurements data={data} setData={setData} />}
            {step === 3 && <StepColors data={data} setData={setData} />}
            {step === 4 && (
              <StepReview
                data={data}
                activeCats={activeCats}
                onSubmit={submit}
                isSubmitting={createRequest.isPending}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
              >
                <ChevronLeft className="w-4 h-4" />
                Home
              </Link>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                className="rounded-full px-6 bg-[#2D1E17] text-white hover:bg-[#2D1E17]/90 font-sans"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}

function StepUpload({
  data,
  setData,
  setFile,
}: {
  data: WizardState;
  setData: React.Dispatch<React.SetStateAction<WizardState>>;
  setFile: (f: File | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Upload Your Inspiration</h1>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          Share an image of the design you&apos;d like us to create, or describe your vision.
        </p>
      </div>

      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-[#2D1E17]/40 transition-colors bg-muted/20 min-h-[200px]">
          {data.inspirationPreview ? (
            <img
              src={data.inspirationPreview}
              alt="Inspiration"
              className="max-h-48 rounded-lg object-contain mb-2"
            />
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1.25} />
              <p className="font-sans text-sm font-medium text-foreground">Upload an image</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="space-y-2">
        <Label className="font-sans font-semibold text-foreground">Describe Your Design</Label>
        <textarea
          className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-sans placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell us about your vision, preferred style, occasion, or any specific details..."
          value={data.description}
          onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
        />
      </div>
    </div>
  );
}

function StepCategory({
  activeCats,
  data,
  setData,
}: {
  activeCats: { id: number; name: string }[];
  data: WizardState;
  setData: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-1">Select Category</h1>
      <p className="text-sm text-muted-foreground font-sans mb-6">What type of piece are you looking for?</p>
      <div className="grid gap-2">
        {activeCats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setData((d) => ({ ...d, categoryId: c.id }))}
            className={`text-left px-4 py-3 rounded-lg border font-sans text-sm transition-colors ${
              data.categoryId === c.id
                ? "border-[#2D1E17] bg-[#2D1E17]/5"
                : "border-border hover:border-[#2D1E17]/30"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      {activeCats.length === 0 && (
        <p className="text-sm text-muted-foreground">No categories available yet. You can still continue.</p>
      )}
    </div>
  );
}

function StepMeasurements({
  data,
  setData,
}: {
  data: WizardState;
  setData: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  const field = (key: keyof WizardState, label: string, ph: string) => (
    <div className="space-y-1.5">
      <Label className="font-sans text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input
        value={data[key] as string}
        onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
        placeholder={ph}
        className="font-sans"
      />
    </div>
  );
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-1">Measurements</h1>
      <p className="text-sm text-muted-foreground font-sans mb-6">
        Share your measurements (in inches). Approximate is fine — we&apos;ll confirm details later.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {field("bust", "Bust", 'e.g. 36"')}
        {field("waist", "Waist", 'e.g. 28"')}
        {field("hip", "Hip", 'e.g. 38"')}
        {field("height", "Height", 'e.g. 5ft 4in')}
      </div>
    </div>
  );
}

function StepColors({
  data,
  setData,
}: {
  data: WizardState;
  setData: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-1">Color Selection</h1>
      <p className="text-sm text-muted-foreground font-sans mb-6">
        Preferred colours, contrasts, or fabric tones (e.g. ivory, deep maroon, pastels).
      </p>
      <textarea
        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-sans"
        placeholder="Describe your colour preferences..."
        value={data.colors}
        onChange={(e) => setData((d) => ({ ...d, colors: e.target.value }))}
      />
    </div>
  );
}

function StepReview({
  data,
  activeCats,
  onSubmit,
  isSubmitting,
}: {
  data: WizardState;
  activeCats: { id: number; name: string }[];
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
}) {
  const cat = activeCats.find((c) => c.id === data.categoryId);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-1">Review &amp; Submit</h1>
      <p className="text-sm text-muted-foreground font-sans">Please confirm your details before sending.</p>
      <dl className="space-y-3 text-sm font-sans border-t border-border pt-4">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Inspiration</dt>
          <dd className="text-right">{data.inspirationFile ? data.inspirationFile.name : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground mb-1">Description</dt>
          <dd className="text-foreground whitespace-pre-wrap">{data.description || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Category</dt>
          <dd>{cat?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Measurements</dt>
          <dd className="text-right">
            {[data.bust, data.waist, data.hip, data.height].filter(Boolean).join(" · ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground mb-1">Colours</dt>
          <dd className="whitespace-pre-wrap">{data.colors || "—"}</dd>
        </div>
      </dl>
      <Button
        type="button"
        onClick={() => void onSubmit()}
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-full px-8 bg-[#2D1E17] text-white hover:bg-[#2D1E17]/90 font-sans"
      >
        {isSubmitting ? "Submitting…" : "Submit request"}
      </Button>
    </div>
  );
}
