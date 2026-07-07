import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Admin — Ledger" }] }),
});

function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);

  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    },
  });

  const filtered = useMemo(() => {
    return (users ?? []).filter((u) =>
      q ? (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()) || (u.email ?? "").toLowerCase().includes(q.toLowerCase()) : true
    );
  }, [users, q]);

  const toggleStatus = useMutation({
    const toggleStatus = useMutation({
      mutationFn: async ({ id, status }: { id: string; status: string }) => {
        const { error } = await supabase
          .from("profiles")
          .update({ status })
          .eq("id", id);

        if (error) throw error;
      },
      onSuccess: () => {
        toast.success("Updated");
        qc.invalidateQueries({ queryKey: ["admin-users"] });
      },
      onError: (e: any) => toast.error(e.message),
    });
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading || !isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="size-5" /></div>
        <div>
          <h1 className="font-display text-4xl">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage user accounts.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-secondary/30">
                <td className="px-6 py-3">{u.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "outline" : "destructive"}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={u.status === "active" ? "outline" : "default"}
                    onClick={() => toggleStatus.mutate({ id: u._id, status: u.status === "active" ? "inactive" : "active" })}
                    disabled={u._id === user?._id}
                  >
                    {u.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Note: Deactivating a user marks them inactive in the profile record. Removing the auth account requires backend admin access.
      </p>
    </div>
  );
}
