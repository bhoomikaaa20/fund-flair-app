import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { z } from "zod";

type Kind = "income" | "expense";

export const INCOME_SOURCES = ["Salary", "Freelancing", "Business", "Bonus", "Others"] as const;
export const EXPENSE_CATEGORIES = ["Food", "Shopping", "Bills", "Travel", "Medical", "Education", "Entertainment", "Others"] as const;
export const PAYMENT_METHODS = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking"] as const;

const baseSchema = z.object({
  amount: z.number().positive().max(100000000),
  date: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
});

type Row = {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  source?: string;
  category?: string;
  payment_method?: string;
};

export function TransactionList({ kind, title, subtitle }: { kind: Kind; title: string; subtitle: string }) {
  const table = kind === "income" ? "incomes" : "expenses";
  const qc = useQueryClient();
  const { data: rows, isLoading } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("date", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["totals"] });
      qc.invalidateQueries({ queryKey: ["recent"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="size-4" /> Add {kind}</Button>
          </DialogTrigger>
          <TxDialog kind={kind} editing={editing} onDone={() => setOpen(false)} />
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (rows?.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No entries yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">{kind === "income" ? "Source" : "Category"}</th>
                {kind === "expense" && <th className="px-4 py-3 text-left font-medium">Payment</th>}
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows!.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-6 py-3">{kind === "income" ? r.source : r.category}</td>
                  {kind === "expense" && <td className="px-4 py-3 text-muted-foreground">{r.payment_method}</td>}
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.description}</td>
                  <td className={`px-4 py-3 text-right font-medium ${kind === "income" ? "text-success" : "text-destructive"}`}>
                    {kind === "income" ? "+" : "−"}{formatCurrency(Number(r.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost"><Trash2 className="size-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => del.mutate(r.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TxDialog({ kind, editing, onDone }: { kind: Kind; editing: Row | null; onDone: () => void }) {
  const qc = useQueryClient();
  const table = kind === "income" ? "incomes" : "expenses";
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState(editing?.amount?.toString() ?? "");
  const [date, setDate] = useState(editing?.date ?? today);
  const [description, setDescription] = useState(editing?.description ?? "");
  const [source, setSource] = useState(editing?.source ?? INCOME_SOURCES[0]);
  const [category, setCategory] = useState(editing?.category ?? EXPENSE_CATEGORIES[0]);
  const [payment, setPayment] = useState(editing?.payment_method ?? PAYMENT_METHODS[0]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = baseSchema.safeParse({ amount: Number(amount), date, description });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const payload: any = {
        user_id: user.id,
        amount: Number(amount),
        date,
        description: description || null,
      };
      if (kind === "income") payload.source = source;
      else { payload.category = category; payload.payment_method = payment; }

      const q = editing
        ? supabase.from(table).update(payload).eq("id", editing.id)
        : supabase.from(table).insert(payload);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Updated" : "Added");
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["totals"] });
      qc.invalidateQueries({ queryKey: ["recent"] });
      onDone();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit" : "Add"} {kind}</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        {kind === "income" ? (
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INCOME_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={payment} onValueChange={setPayment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
