import { createFileRoute } from "@tanstack/react-router";
import { TransactionList } from "@/components/TransactionList";

export const Route = createFileRoute("/_authenticated/income")({
  component: () => <TransactionList kind="income" title="Income" subtitle="Money coming in." />,
  head: () => ({ meta: [{ title: "Income — Ledger" }] }),
});
