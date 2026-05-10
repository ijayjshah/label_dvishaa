import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListAdminCustomOrderRequests,
  getListAdminCustomOrderRequestsQueryKey,
  useUpdateAdminCustomOrderRequest,
  type CustomOrderRequest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

const statuses = ["pending", "contacted", "in_progress", "completed", "cancelled"] as const;

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  contacted: "bg-sky-100 text-sky-900",
  in_progress: "bg-violet-100 text-violet-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminCustomOrders() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number] | undefined>();
  const [detail, setDetail] = useState<CustomOrderRequest | null>(null);

  const { data, isLoading } = useListAdminCustomOrderRequests({
    page,
    status: statusFilter,
  });
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const updateMutation = useUpdateAdminCustomOrderRequest({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminCustomOrderRequestsQueryKey() });
        setDetail(null);
        toast({ title: "Request updated" });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
  });

  return (
    <AdminLayout title="Custom orders">
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Design inquiries from the storefront wizard. Inspiration images are stored in Cloudinary; all other fields are in
        the database.
      </p>

      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button
          type="button"
          onClick={() => {
            setStatusFilter(undefined);
            setPage(1);
          }}
          className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
            !statusFilter ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/30"
          }`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs border rounded-lg capitalize transition-colors ${
              statusFilter === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/30"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-serif text-lg">No custom order requests yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setDetail(row)}
                className="w-full text-left rounded-lg border border-border bg-background p-4 hover:border-primary/40 transition-colors"
                data-testid={`row-custom-order-${row.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Request #{row.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {row.userEmail ?? row.userName ?? "Guest"} · {new Date(row.createdAt).toLocaleString("en-IN")}
                    </p>
                    {row.categoryName && (
                      <p className="text-xs text-muted-foreground mt-1">Category: {row.categoryName}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusClass[row.status] ?? "bg-muted"}`}>
                    {row.status.replace("_", " ")}
                  </span>
                </div>
                {row.description && (
                  <p className="text-xs text-foreground/80 mt-2 line-clamp-2">{row.description}</p>
                )}
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground self-center px-2">
                Page {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Request #{detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <DetailForm
              row={detail}
              onClose={() => setDetail(null)}
              onSave={(patch) => updateMutation.mutate({ id: detail.id, data: patch })}
              isSaving={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function DetailForm({
  row,
  onClose,
  onSave,
  isSaving,
}: {
  row: CustomOrderRequest;
  onClose: () => void;
  onSave: (patch: { status?: (typeof statuses)[number]; adminNotes?: string | null }) => void;
  isSaving: boolean;
}) {
  const [status, setStatus] = useState(row.status);
  const [adminNotes, setAdminNotes] = useState(row.adminNotes ?? "");

  return (
    <div className="space-y-4 mt-2">
      {row.inspirationImageUrl && (
        <div>
          <Label className="text-xs text-muted-foreground">Inspiration</Label>
          <img src={row.inspirationImageUrl} alt="" className="mt-1 rounded-md border border-border max-h-48 object-contain w-full bg-muted/30" />
        </div>
      )}
      <div className="text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Customer:</span> {row.userName ?? "—"} ({row.userEmail ?? "guest"})
        </p>
        <p>
          <span className="text-muted-foreground">Category:</span> {row.categoryName ?? "—"}
        </p>
      </div>
      {row.description && (
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <p className="text-sm mt-1 whitespace-pre-wrap">{row.description}</p>
        </div>
      )}
      <p className="text-sm">
        <span className="text-muted-foreground">Measurements:</span>{" "}
        {[row.bust, row.waist, row.hip, row.height].filter(Boolean).join(" · ") || "—"}
      </p>
      {row.colors && (
        <div>
          <Label className="text-xs text-muted-foreground">Colours</Label>
          <p className="text-sm mt-1 whitespace-pre-wrap">{row.colors}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Status</Label>
        <select
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Internal notes</Label>
        <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder="Notes for your team…" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          type="button"
          disabled={isSaving}
          onClick={() =>
            onSave({
              status,
              adminNotes: adminNotes.trim() || null,
            })
          }
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
