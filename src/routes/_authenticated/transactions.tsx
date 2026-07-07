import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: History,
  head: () => ({ meta: [{ title: "Transactions — Ledger" }] }),
});

function History() {
  const { data } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const [inc, exp] = await Promise.all([
        supabase.from("incomes").select("id, amount, date, description, source"),
        supabase.from("expenses").select("id, amount, date, description, category, payment_method"),
      ]);
      const rows = [
        ...(inc.data ?? []).map((r) => ({ ...r, kind: "income" as const, label: r.source })),
        ...(exp.data ?? []).map((r) => ({ ...r, kind: "expense" as const, label: r.category })),
      ];
      return rows;
    },
  });

  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "income" | "expense">("all");
  const [cat, setCat] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const categories = useMemo(() => {
    const s = new Set<string>();
    (data ?? []).forEach((r) => s.add(r.label));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((r) => (kind === "all" ? true : r.kind === kind))
      .filter((r) => (cat === "all" ? true : r.label === cat))
      .filter((r) => (from ? r.date >= from : true))
      .filter((r) => (to ? r.date <= to : true))
      .filter((r) => (q ? (r.description ?? "").toLowerCase().includes(q.toLowerCase()) || r.label.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data, q, kind, cat, from, to]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Complete history of income and expenses.</p>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search description or category" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={kind} onValueChange={(v) => setKind(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No matching transactions.</div>
        ) : (
          <div className="divide-y">
            {filtered.map((r) => (
              <div key={`${r.kind}-${r.id}`} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className={`grid size-9 place-items-center rounded-full ${r.kind === "income" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {r.kind === "income" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(r.date)}
                      {r.kind === "expense" && (r as any).payment_method ? ` · ${(r as any).payment_method}` : ""}
                      {r.description ? ` · ${r.description}` : ""}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${r.kind === "income" ? "text-success" : "text-destructive"}`}>
                  {r.kind === "income" ? "+" : "−"}{formatCurrency(Number(r.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
