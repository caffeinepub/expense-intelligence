import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Expense } from "../backend";
import { Category } from "../backend";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/categories";
import { formatCurrency, formatDate } from "../lib/utils";

export function ExpensesPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => actor!.getExpenses(),
    enabled: !!actor,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => actor!.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
    },
  });

  const filtered = (expenses ?? [])
    .filter((e) => categoryFilter === "all" || e.category === categoryFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["analysis"] });
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Expenses</h1>
        <button
          type="button"
          data-ocid="add_expense.open_modal_button"
          onClick={() => setAddOpen(true)}
          className="text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-full"
        >
          + Add
        </button>
      </div>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger data-ocid="expenses.category.select" className="w-full">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {Object.values(Category).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {CATEGORY_ICONS[cat]} {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d", "e"].map((k) => (
            <Skeleton key={k} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="expenses.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <p className="text-4xl mb-3">💸</p>
          <p className="font-medium">No expenses yet</p>
          <p className="text-sm">Add your first expense above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((exp, i) => (
            <div
              key={String(exp.id)}
              data-ocid={`expense.item.${i + 1}`}
              className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-3"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[exp.category]}22`,
                }}
              >
                {CATEGORY_ICONS[exp.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {exp.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(exp.date)}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {exp.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  -{formatCurrency(exp.amount)}
                </span>
                <button
                  type="button"
                  data-ocid={`expense.edit_button.${i + 1}`}
                  onClick={() => setEditExpense(exp)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  data-ocid={`expense.delete_button.${i + 1}`}
                  onClick={() => deleteMutation.mutate(exp.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExpenseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={invalidate}
      />
      {editExpense && (
        <AddExpenseModal
          open={!!editExpense}
          onClose={() => setEditExpense(null)}
          onSaved={() => {
            setEditExpense(null);
            invalidate();
          }}
          editExpense={editExpense}
        />
      )}
    </div>
  );
}
