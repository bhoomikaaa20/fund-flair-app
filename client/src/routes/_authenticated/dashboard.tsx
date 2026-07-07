import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/lib/auth";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Ledger" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const uid = user?._id;

  const { data: totals } = useQuery({
    queryKey: ["totals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/dashboard/totals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent", uid],
    enabled: !!uid,
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/dashboard/recent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your money at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Income"
          value={totals?.income ?? 0}
          icon={TrendingUp}
          tone="success"
        />

        <StatCard
          label="Total Expenses"
          value={totals?.expense ?? 0}
          icon={TrendingDown}
          tone="destructive"
        />

        <StatCard
          label="Current Balance"
          value={totals?.balance ?? 0}
          icon={Wallet}
          tone="primary"
        />
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-medium">Recent Transactions</h2>
        </div>

        <div className="divide-y">
          {(recent ?? []).length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No transactions yet. Add your first income or expense.
            </div>
          )}

          {(recent ?? []).map((r: any) => (
            <div
              key={`${r.kind}-${r._id}`}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid size-9 place-items-center rounded-full ${r.kind === "income"
                    ? "bg-success/15 text-success"
                    : "bg-destructive/10 text-destructive"
                    }`}
                >
                  {r.kind === "income" ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium">{r.label}</div>

                  <div className="text-xs text-muted-foreground">
                    {formatDate(r.date)}
                    {r.description ? ` · ${r.description}` : ""}
                  </div>
                </div>
              </div>

              <div
                className={`text-sm font-medium ${r.kind === "income"
                  ? "text-success"
                  : "text-destructive"
                  }`}
              >
                {r.kind === "income" ? "+" : "−"}
                {formatCurrency(Number(r.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: any;
  tone: "success" | "destructive" | "primary";
}) {
  const toneClass =
    tone === "success"
      ? "text-success bg-success/10"
      : tone === "destructive"
        ? "text-destructive bg-destructive/10"
        : "text-primary bg-primary/10";

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>

        <div
          className={`grid size-8 place-items-center rounded-lg ${toneClass}`}
        >
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-4 font-display text-3xl">
        {formatCurrency(value)}
      </div>
    </div>
  );
}