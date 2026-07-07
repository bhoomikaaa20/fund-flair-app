import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/lib/auth";
import { LayoutDashboard, TrendingUp, TrendingDown, ListOrdered, User, Users, LogOut, Wallet, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/expenses", label: "Expenses", icon: TrendingDown },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function AuthedLayout() {
  const { user, loading } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const items = isAdmin ? [...nav, { to: "/admin", label: "Admin", icon: Users } as const] : nav;

  return (
    <div className="min-h-screen bg-background">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 px-6 py-6">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </div>
            <span className="font-display text-xl">Ledger</span>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {items.map((item) => {
              const active = location.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    active ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <div className="mb-2 px-3 py-1 text-xs text-muted-foreground truncate">{user.email}</div>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="flex items-center gap-3 border-b bg-card/60 px-6 py-3 backdrop-blur md:hidden">
          <button onClick={() => setOpen((o) => !o)} className="rounded-md p-1.5 hover:bg-secondary">
            <Menu className="size-5" />
          </button>
          <span className="font-display text-lg">Ledger</span>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
