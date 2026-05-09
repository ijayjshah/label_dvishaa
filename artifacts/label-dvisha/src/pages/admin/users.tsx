import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListUsers, getListUsersQueryKey, useToggleUserActive } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListUsers({ search: search || undefined, page });
  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const toggleActive = useToggleUserActive({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); toast({ title: "User status updated" }); },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
  });

  return (
    <AdminLayout title="Users">
      <div className="flex items-center gap-3 mb-5">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="max-w-xs text-sm"
          data-testid="input-search"
        />
        <span className="text-sm text-muted-foreground">{total} users</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-background border border-border h-14 animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="font-serif text-xl">No users found</p>
        </div>
      ) : (
        <>
          <div className="bg-background border border-border divide-y divide-border">
            {users.map((user: any) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-user-${user.id}`}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}{user.role === "admin" ? " · Admin" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  {user.role !== "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => toggleActive.mutate({ id: user.id })}
                      disabled={toggleActive.isPending}
                      data-testid={`button-toggle-${user.id}`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
