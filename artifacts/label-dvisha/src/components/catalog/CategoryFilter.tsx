import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Category } from "@workspace/api-client-react";
import { motionEase } from "@/components/motion";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type CategoryFilterValue =
  | { kind: "all" }
  | { kind: "parent"; id: number }
  | { kind: "child"; id: number; parentId: number };

type Props = {
  roots: Category[];
  subsByParent: Map<number, Category[]>;
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
};

function filterLabel(
  value: CategoryFilterValue,
  roots: Category[],
  subsByParent: Map<number, Category[]>,
): string {
  if (value.kind === "all") return "All";
  if (value.kind === "parent") return roots.find((r) => r.id === value.id)?.name ?? "Collection";
  const subs = subsByParent.get(value.parentId) ?? [];
  return subs.find((s) => s.id === value.id)?.name ?? "Category";
}

function parentIdForValue(value: CategoryFilterValue): number | undefined {
  if (value.kind === "parent") return value.id;
  if (value.kind === "child") return value.parentId;
  return undefined;
}

function isChildActive(value: CategoryFilterValue, childId: number) {
  return value.kind === "child" && value.id === childId;
}

function isParentActive(value: CategoryFilterValue, parentId: number, hasChildren: boolean) {
  if (value.kind === "parent" && value.id === parentId) return true;
  if (hasChildren && value.kind === "child" && value.parentId === parentId) return true;
  return false;
}

type TreeProps = {
  roots: Category[];
  subsByParent: Map<number, Category[]>;
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  onSelect?: () => void;
  compact?: boolean;
};

function CategoryTree({ roots, subsByParent, value, onChange, onSelect, compact }: TreeProps) {
  const activeParentId = parentIdForValue(value);
  const [expanded, setExpanded] = useState<Set<number>>(() =>
    activeParentId ? new Set([activeParentId]) : new Set(),
  );

  useEffect(() => {
    if (activeParentId) {
      setExpanded((prev) => new Set(prev).add(activeParentId));
    }
  }, [activeParentId]);

  function toggleParent(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function select(value: CategoryFilterValue) {
    onChange(value);
    onSelect?.();
  }

  return (
    <div className={cn("space-y-1", compact && "space-y-0.5")}>
      <button
        type="button"
        onClick={() => select({ kind: "all" })}
        className={cn(
          "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
          value.kind === "all"
            ? "bg-foreground/[0.06] text-foreground font-medium"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        data-testid="button-category-all"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
            value.kind === "all" ? "bg-[#C4A574]" : "bg-transparent group-hover:bg-border",
          )}
        />
        All Pieces
      </button>

      <div className="my-3 h-px bg-gradient-to-r from-border/80 via-border/40 to-transparent" />

      {roots.map((root) => {
        const subs = subsByParent.get(root.id) ?? [];
        const hasChildren = subs.length > 0;
        const open = expanded.has(root.id);
        const parentActive = isParentActive(value, root.id, hasChildren);

        if (!hasChildren) {
          return (
            <button
              key={root.id}
              type="button"
              onClick={() => select({ kind: "parent", id: root.id })}
              className={cn(
                "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                parentActive
                  ? "bg-foreground/[0.06] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
              data-testid={`button-category-${root.id}`}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                  parentActive ? "bg-[#C4A574]" : "bg-transparent group-hover:bg-border",
                )}
              />
              {root.name}
            </button>
          );
        }

        return (
          <div key={root.id} className="rounded-md">
            <div className="flex items-stretch gap-0.5">
              <button
                type="button"
                onClick={() => select({ kind: "parent", id: root.id })}
                className={cn(
                  "group flex flex-1 items-center gap-3 rounded-l-md px-3 py-2.5 text-left text-sm transition-colors min-w-0",
                  parentActive && value.kind === "parent"
                    ? "bg-foreground/[0.06] text-foreground font-medium"
                    : parentActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                    parentActive ? "bg-[#C4A574]" : "bg-transparent group-hover:bg-border",
                  )}
                />
                <span className="truncate font-serif">{root.name}</span>
              </button>
              <button
                type="button"
                aria-expanded={open}
                aria-label={`${open ? "Collapse" : "Expand"} ${root.name}`}
                onClick={() => toggleParent(root.id)}
                className={cn(
                  "flex w-10 shrink-0 items-center justify-center rounded-r-md transition-colors",
                  open ? "bg-muted/40 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.28, ease: motionEase }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: motionEase }}
                  className="overflow-hidden"
                >
                  <div className="ml-3 border-l border-[#C4A574]/30 py-1 pl-3 mr-1 space-y-0.5">
                    {subs.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => select({ kind: "child", id: sub.id, parentId: root.id })}
                        className={cn(
                          "block w-full rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                          isChildActive(value, sub.id)
                            ? "bg-foreground/[0.06] text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                        )}
                        data-testid={`button-category-${sub.id}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                    <Link
                      href={`/collections/${root.slug}`}
                      onClick={onSelect}
                      className="block px-2.5 py-2 text-[10px] tracking-[0.14em] uppercase text-[#C4A574] hover:text-foreground transition-colors"
                    >
                      View collection →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryFilter({ roots, subsByParent, value, onChange }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeLabel = filterLabel(value, roots, subsByParent);
  const activeParentId = parentIdForValue(value);

  const mobileSubs = useMemo(() => {
    if (!activeParentId) return [];
    return subsByParent.get(activeParentId) ?? [];
  }, [activeParentId, subsByParent]);

  return (
    <>
      {/* Mobile: compact bar + horizontal chips */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs tracking-wide transition-colors",
                  value.kind !== "all"
                    ? "border-foreground/20 bg-foreground/[0.04] text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Categories
                {value.kind !== "all" && (
                  <span className="rounded-full bg-[#C4A574]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#8a7348]">1</span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-2rem,320px)] p-0 flex flex-col">
              <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/60 text-left">
                <SheetTitle className="font-serif text-xl font-normal tracking-tight">Shop by Category</SheetTitle>
                <p className="text-xs text-muted-foreground pt-1">Browse collections and styles</p>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 py-5">
                <CategoryTree
                  roots={roots}
                  subsByParent={subsByParent}
                  value={value}
                  onChange={onChange}
                  onSelect={() => setSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {value.kind !== "all" && (
            <button
              type="button"
              onClick={() => onChange({ kind: "all" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/[0.04] px-3 py-2 text-xs text-foreground"
            >
              {activeLabel}
              <span className="text-muted-foreground">×</span>
            </button>
          )}
        </div>

        <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 px-1 min-w-min">
            <button
              type="button"
              onClick={() => onChange({ kind: "all" })}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs tracking-wide transition-all duration-300",
                value.kind === "all"
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border/80 text-muted-foreground hover:border-foreground/30",
              )}
            >
              All
            </button>
            {roots.map((root) => {
              const active = isParentActive(value, root.id, (subsByParent.get(root.id)?.length ?? 0) > 0);
              return (
                <button
                  key={root.id}
                  type="button"
                  onClick={() => onChange({ kind: "parent", id: root.id })}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-xs tracking-wide transition-all duration-300",
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border/80 text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  {root.name}
                </button>
              );
            })}
          </div>
        </div>

        {mobileSubs.length > 0 && (
          <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2 px-1 min-w-min">
              {mobileSubs.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onChange({ kind: "child", id: sub.id, parentId: activeParentId! })}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] transition-all duration-300",
                    isChildActive(value, sub.id)
                      ? "border-[#C4A574] bg-[#C4A574]/10 text-foreground font-medium"
                      : "border-border/60 text-muted-foreground hover:border-[#C4A574]/40",
                  )}
                  data-testid={`button-mobile-category-${sub.id}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop: refined sidebar tree */}
      <div className="hidden md:block">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Shop by Category</p>
        <CategoryTree roots={roots} subsByParent={subsByParent} value={value} onChange={onChange} />
      </div>
    </>
  );
}

export function categoryFilterFromId(
  categoryId: number | undefined,
  categories: Category[],
): CategoryFilterValue {
  if (!categoryId) return { kind: "all" };
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return { kind: "all" };
  if (cat.parentId != null) return { kind: "child", id: cat.id, parentId: cat.parentId };
  return { kind: "parent", id: cat.id };
}

export function categoryFilterToApiParams(filter: CategoryFilterValue) {
  if (filter.kind === "all") return {};
  if (filter.kind === "parent") return { categoryParentId: filter.id };
  return { categoryId: filter.id };
}
