import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const panel = "#EDE8E0";
const brand = "#2D1E17";
const exampleColor = "#B85C4A";

const MEASURE_STEPS = [
  {
    n: 1,
    title: "Bust",
    body: "Measure around the fullest part of your bust, keeping the tape parallel to the ground. Don't pull the tape too tight.",
    example: "Example: 36 inches",
  },
  {
    n: 2,
    title: "Waist",
    body: "Measure around your natural waistline (the narrowest part of your torso, usually just above the belly button). Stand relaxed, don't suck in.",
    example: "Example: 28 inches",
  },
  {
    n: 3,
    title: "Hip",
    body: "Measure around the fullest part of your hips (usually 7–9 inches below your waist). Keep feet together and tape parallel to the floor.",
    example: "Example: 38 inches",
  },
] as const;

const SIZE_COLUMNS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] as const;

const SIZE_CHART_ROWS = [
  { label: "C", values: ["34", "36", "38", "40", "42", "44", "46", "48", "50"] },
  { label: "W", values: ["28", "30", "32", "34", "36", "38", "40", "42", "44"] },
  { label: "H", values: ["36", "38", "40", "42", "44", "46", "48", "50", "52"] },
  { label: "SO", values: ["13.5", "14", "14.5", "15", "15.5", "16", "16.5", "17", "17.5"] },
  { label: "SL", values: ["15", "15", "15.5", "16", "16.5", "17", "17.5", "18", "18"] },
  { label: "SB", values: ["9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"] },
  { label: "M", values: ["6", "6.5", "7", "7", "7.5", "7.5", "8", "8", "8.5"] },
  { label: "A", values: ["14", "15", "15.5", "16", "16.5", "17", "18", "19", "20"] },
] as const;

const PRO_TIPS = [
  "Measure yourself in the morning for the most consistent results",
  "Have someone help you for more accurate measurements",
  "Don't measure over bulky clothing — wear fitted undergarments only",
  "If you're between sizes, we recommend sizing up or choosing custom measurements",
  "For custom orders, remeasure yourself to ensure the latest dimensions",
] as const;

function HowToMeasureDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 300"
      className={cn("mx-auto h-auto w-full max-w-[200px] text-foreground", className)}
      aria-hidden
    >
      {/* Height bracket left */}
      <text x="12" y="155" className="fill-current text-[9px] font-sans font-medium" transform="rotate(-90 12 155)">
        Height
      </text>
      <path
        d="M 28 42 L 28 258"
        className="stroke-current"
        strokeWidth="1.2"
        fill="none"
      />
      <path d="M 24 42 L 32 42 M 24 258 L 32 258" className="stroke-current" strokeWidth="1.2" fill="none" />

      {/* Figure */}
      <circle cx="118" cy="48" r="14" className="fill-none stroke-current" strokeWidth="1.5" />
      <path
        d="M 118 62 L 118 175 M 88 88 L 118 72 L 148 88 M 102 175 L 118 120 L 134 175 M 102 175 L 96 248 M 134 175 L 140 248"
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bust line */}
      <line x1="72" y1="98" x2="164" y2="98" className="stroke-current opacity-60" strokeWidth="1" strokeDasharray="4 4" />
      <text x="170" y="102" className="fill-current font-sans text-[10px]">Bust</text>

      {/* Waist line */}
      <line x1="78" y1="128" x2="158" y2="128" className="stroke-current opacity-60" strokeWidth="1" strokeDasharray="4 4" />
      <text x="164" y="132" className="fill-current font-sans text-[10px]">Waist</text>

      {/* Hip line */}
      <line x1="82" y1="158" x2="154" y2="158" className="stroke-current opacity-60" strokeWidth="1" strokeDasharray="4 4" />
      <text x="160" y="162" className="fill-current font-sans text-[10px]">Hip</text>
    </svg>
  );
}

export type MeasurementGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Static measurement & size guide. Use anywhere with local `open` / `onOpenChange` state.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <button type="button" onClick={() => setOpen(true)}>Size Guide</button>
 * <MeasurementGuideDialog open={open} onOpenChange={setOpen} />
 */
export function MeasurementGuideDialog({ open, onOpenChange }: MeasurementGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,880px)] w-[min(calc(100vw-2rem),56rem)] max-w-none gap-0 overflow-y-auto p-0 sm:rounded-2xl",
          "border-border/80 bg-background"
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur-sm sm:px-8">
          <DialogTitle className="font-serif text-2xl font-normal tracking-tight text-foreground pr-10">
            Measurement Guide
          </DialogTitle>
        </div>

        <div className="space-y-10 px-5 pb-8 pt-8 sm:px-8">
          {/* Intro */}
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-foreground"
              aria-hidden
            >
              <Ruler className="h-7 w-7" strokeWidth={1.25} />
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              For the perfect fit, measure yourself while wearing fitted undergarments. Keep the tape measure snug but
              not tight, and stand naturally with good posture.
            </p>
          </div>

          {/* How to measure + cards */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div
              className="flex flex-col rounded-2xl border border-border/50 p-6 sm:p-8"
              style={{ backgroundColor: panel }}
            >
              <h3 className="mb-6 text-center font-serif text-xl text-foreground">How to Measure</h3>
              <HowToMeasureDiagram className="max-w-[220px]" />
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Use a flexible measuring tape and measure in inches
              </p>
            </div>

            <div className="space-y-4">
              {MEASURE_STEPS.map((step) => (
                <div
                  key={step.n}
                  className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
                      aria-hidden
                    >
                      {step.n}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                      <p className="mt-2 text-sm font-medium" style={{ color: exampleColor }}>
                        {step.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size chart */}
          <div>
            <h3 className="mb-4 text-center font-serif text-xl text-foreground">Standard Size Chart</h3>
            <p className="mb-4 text-center text-xs text-muted-foreground">All measurements in inches</p>
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: brand, color: "#F9F6F1" }}>
                    <th className="sticky left-0 z-[1] px-4 py-3 text-left font-semibold" style={{ backgroundColor: brand }}>
                      Size
                    </th>
                    {SIZE_COLUMNS.map((size) => (
                      <th key={size} className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? "bg-background" : ""}
                      style={i % 2 === 1 ? { backgroundColor: "hsl(40 30% 97%)" } : undefined}
                    >
                      <td
                        className="sticky left-0 z-[1] px-4 py-3 font-semibold text-foreground"
                        style={{ backgroundColor: i % 2 === 0 ? "hsl(var(--background))" : "hsl(40 30% 97%)" }}
                      >
                        {row.label}
                      </td>
                      {row.values.map((value, j) => (
                        <td key={`${row.label}-${SIZE_COLUMNS[j]}`} className="px-3 py-3 text-center text-muted-foreground whitespace-nowrap">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pro tips */}
          <div
            className="rounded-2xl border border-border/50 p-6 sm:p-8"
            style={{ backgroundColor: panel }}
          >
            <h3 className="mb-4 font-serif text-lg text-foreground">Pro Tips for Accurate Measurements</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-foreground/40">
              {PRO_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 border-t border-border/60 pt-6 text-center">
            <p className="text-sm text-muted-foreground">Still need help? Our team is here to assist you.</p>
            <DialogClose asChild>
              <Button
                type="button"
                className="rounded-full bg-[#2D1E17] px-10 tracking-wide text-[#F9F6F1] hover:bg-[#2D1E17]/90"
              >
                Got It
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
