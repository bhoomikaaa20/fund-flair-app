import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PieChart, Shield, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Finance Tracker — Personal Expense Management" },
      { name: "description", content: "Track income, expenses, and your balance. Simple, secure, and beautifully organized." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </div>
          <span className="font-display text-xl">Ledger</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Get started <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Personal finance, simplified
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Every rupee, <em className="text-primary">accounted for</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A calm, private place to log income and expenses, watch your balance, and understand where your money actually goes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start tracking <ArrowRight className="size-4" />
            </Link>
            <Link to="/auth" className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-medium hover:bg-secondary">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: TrendingUp, title: "Income & expenses", body: "Log every transaction with category, date, and payment method." },
            { icon: PieChart, title: "Clear dashboard", body: "See total income, expenses, current balance, and recent activity at a glance." },
            { icon: Shield, title: "Private by default", body: "Your data is scoped to you. Encrypted auth, row-level access." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-4 font-medium">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          Ledger · A calm way to track your money.
        </div>
      </footer>
    </div>
  );
}
