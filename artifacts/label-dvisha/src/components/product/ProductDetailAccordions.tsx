import { Minus, Plus } from "lucide-react";
import type { FixedProductDetailSection } from "@/lib/product-fabric-care";

type Props = {
  sections: readonly FixedProductDetailSection[];
  openSections: Record<string, boolean>;
  onToggle: (id: string) => void;
};

export function ProductDetailAccordions({ sections, openSections, onToggle }: Props) {
  return (
    <div className="mt-6 space-y-3">
      {sections.map((section) => {
        const isOpen = openSections[section.id] ?? false;
        return (
          <div
            key={section.id}
            className="rounded-xl border border-border/80 bg-muted/20 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left hover:bg-muted/30 transition-colors"
              onClick={() => onToggle(section.id)}
              data-testid={`button-section-${section.id}`}
            >
              <span className="text-sm font-medium text-foreground">{section.title}</span>
              {isOpen ? (
                <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-border/50">
                {section.type === "text" ? (
                  <p className="text-sm text-muted-foreground leading-relaxed pt-3">{section.content}</p>
                ) : (
                  <ul className="pt-3 space-y-2.5">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/35" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
