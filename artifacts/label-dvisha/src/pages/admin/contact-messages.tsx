import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAdminContactMessages, type ContactMessage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";

export default function AdminContactMessages() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<ContactMessage | null>(null);

  const { data, isLoading } = useListAdminContactMessages({ page });
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <AdminLayout title="Contact messages">
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Messages sent from the storefront contact form. Logged-in customers are linked when they submit while signed in.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-serif text-lg">No messages yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setOpen(row)}
                className="w-full text-left rounded-lg border border-border bg-background px-4 py-3 hover:border-primary/40 transition-colors"
                data-testid={`row-contact-${row.id}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{row.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{row.email}</p>
                <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{row.message}</p>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Message from {open?.fullName}</DialogTitle>
          </DialogHeader>
          {open && (
            <dl className="space-y-3 text-sm mt-2">
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Email</dt>
                <dd>
                  <a href={`mailto:${open.email}`} className="text-foreground hover:underline">
                    {open.email}
                  </a>
                </dd>
              </div>
              {open.phone && (
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Phone</dt>
                  <dd>{open.phone}</dd>
                </div>
              )}
              {(open.accountEmail || open.userId) && (
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Account</dt>
                  <dd className="text-muted-foreground">
                    {open.accountEmail ?? `User ID ${open.userId}`}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Message</dt>
                <dd className="whitespace-pre-wrap text-foreground">{open.message}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Received</dt>
                <dd>{new Date(open.createdAt).toLocaleString("en-IN")}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
