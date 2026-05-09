import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListGallery, getListGalleryQueryKey, useApproveGallery, useDeleteGallery } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Trash2 } from "lucide-react";

export default function AdminGallery() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showPending, setShowPending] = useState(true);

  const { data, isLoading } = useListGallery({ approved: showPending ? undefined : true, page: 1 } as any);
  const items = data?.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: getListGalleryQueryKey() });

  const approveMutation = useApproveGallery({
    mutation: { onSuccess: () => { invalidate(); toast({ title: "Approved" }); }, onError: () => toast({ title: "Failed", variant: "destructive" }) },
  });
  const deleteMutation = useDeleteGallery({
    mutation: { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Failed", variant: "destructive" }) },
  });

  return (
    <AdminLayout title="Gallery">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setShowPending(true)}
          className={`px-3 py-1.5 text-xs border transition-colors ${showPending ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
          data-testid="filter-pending"
        >
          Pending Review
        </button>
        <button
          onClick={() => setShowPending(false)}
          className={`px-3 py-1.5 text-xs border transition-colors ${!showPending ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
          data-testid="filter-approved"
        >
          Approved
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-xl">{showPending ? "No pending items" : "No approved items"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="relative group overflow-hidden border border-border" data-testid={`card-gallery-${item.id}`}>
              <img src={item.imageUrl} alt={item.caption ?? ""} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {item.caption && <p className="text-white text-xs text-center line-clamp-2">{item.caption}</p>}
                {item.userName && <p className="text-white/70 text-xs">{item.userName}</p>}
                <div className="flex gap-2 mt-1">
                  {!item.isApproved && (
                    <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700" onClick={() => approveMutation.mutate({ id: item.id })} data-testid={`button-approve-${item.id}`}>
                      <Check className="w-3 h-3 mr-1" /> Approve
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" className="text-xs" onClick={() => deleteMutation.mutate({ id: item.id })} data-testid={`button-delete-${item.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {item.isApproved && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
