import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: History,
  head: () => ({ meta: [{ title: "Transactions — Ledger" }] }),
});

function History() {
  const { user } = useAuth();
  const uid = user?._id;

  const { data } = useQuery({
    queryKey: ["history", uid],
    enabled: !!uid,
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    },
  });

  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "income" | "expense">("all");
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const categories = useMemo(() => {
    const s = new Set<string>();

    (data ?? []).forEach((r: any) => s.add(r.label));

    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((r: any) =>
        kind === "all" ? true : r.kind === kind
      )
      .filter((r: any) =>
        cat === "all" ? true : r.label === cat
      )
      .filter((r: any) =>
        from ? r.date >= from : true
      )
      .filter((r: any) =>
        to ? r.date <= to : true
      )
      .filter((r: any) =>
        q
          ? (r.description ?? "")
            .toLowerCase()
            .includes(q.toLowerCase()) ||
          r.label
            .toLowerCase()
            .includes(q.toLowerCase())
          : true
      )
      .sort((a: any, b: any) =>
        a.date < b.date ? 1 : -1
      );
  }, [data, q, kind, cat, from, to]);
