import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Category } from "../backend";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { CATEGORY_ICONS, DEFAULT_BUDGETS } from "../lib/categories";
import { formatCurrency } from "../lib/utils";

export function BudgetsPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => actor!.getBudgets(),
    enabled: !!actor,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["analysis"],
    queryFn: () => actor!.analyzeSpending(),
    enabled: !!actor,
  });

  const setBudgetMutation = useMutation({
    mutationFn: ({ cat, limit }: { cat: Category; limit: number }) =>
      actor!.setBudget(cat, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      setEditCategory(null);
    },
  });

  const budgetMap = Object.fromEntries(
    (budgets ?? []).map((b) => [b.category, b.limit]),
  ) as Record<Category, number>;
  const summaryMap = Object.fromEntries(
    (analysis?.categorySummaries ?? []).map((s) => [s.category, s]),
  ) as unknown as Record<
    Category,
    { spentThisMonth: number; percentageUsed: number; overspent: boolean }
  >;

  const isLoading = budgetsLoading || analysisLoading;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Budgets</h1>
      <p className="text-sm text-muted-foreground">
        Set monthly spending limits per category.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {Object.values(Category).map((cat, i) => {
            const limit = budgetMap[cat] ?? DEFAULT_BUDGETS[cat];
            const summary = summaryMap[cat];
            const spent = summary?.spentThisMonth ?? 0;
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const color =
              pct > 100
                ? "bg-red-500"
                : pct > 80
                  ? "bg-yellow-500"
                  : pct > 60
                    ? "bg-orange-400"
                    : "bg-primary";
            const textColor =
              pct > 80
                ? "text-red-400"
                : pct > 60
                  ? "text-yellow-400"
                  : "text-foreground";

            return (
              <div
                key={cat}
                data-ocid={`budget.item.${i + 1}`}
                className="bg-card border border-border rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                  <button
                    type="button"
                    data-ocid={`budget.edit_button.${i + 1}`}
                    onClick={() => {
                      setEditCategory(cat);
                      setEditValue(String(limit));
                    }}
                    className="text-[10px] text-primary border border-primary/30 px-1.5 py-0.5 rounded"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{cat}</p>
                  <p className={`text-xs ${textColor}`}>
                    {formatCurrency(spent)} / {formatCurrency(limit)}
                  </p>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {pct.toFixed(0)}% used
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <DialogContent data-ocid="budget.edit.dialog" className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Set Budget for {editCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Monthly limit (₹)</Label>
              <Input
                data-ocid="budget.edit.input"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="budget.edit.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditCategory(null)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="budget.edit.save_button"
                className="flex-1"
                onClick={() => {
                  if (editCategory && editValue) {
                    setBudgetMutation.mutate({
                      cat: editCategory,
                      limit: Number.parseFloat(editValue),
                    });
                  }
                }}
                disabled={setBudgetMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
