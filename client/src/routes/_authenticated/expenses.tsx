import { createFileRoute } from "@tanstack/react-router";
import { TransactionList } from "@/components/TransactionList";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: () => (
    <TransactionList
      kind="expense"
      title="Expenses"
      subtitle="Money going out."
    />
  ),
  head: () => ({
    meta: [{ title: "Expenses — Ledger" }],
  }),
});