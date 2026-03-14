import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Category, type SpendingAnalysis } from "../backend";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { CATEGORY_ICONS, DEFAULT_BUDGETS } from "../lib/categories";
import { SAMPLE_EXPENSES } from "../lib/sampleData";
import { formatCurrency, getCurrentMonthName } from "../lib/utils";
import type { Tab } from "./MainAppTypes";

interface Props {
  onNavigate: (tab: Tab) => void;
}

export function DashboardPage({ onNavigate }: Props) {
  const { actor } = useActor();
  const seeded = useRef(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data: expenses, refetch: refetchExpenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => actor!.getExpenses(),
    enabled: !!actor,
  });

  const { data: budgets, refetch: refetchBudgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => actor!.getBudgets(),
    enabled: !!actor,
  });

  const {
    data: analysis,
    isLoading: analysisLoading,
    refetch: refetchAnalysis,
  } = useQuery<SpendingAnalysis>({
    queryKey: ["analysis"],
    queryFn: () => actor!.analyzeSpending(),
    enabled: !!actor,
  });

  useEffect(() => {
    if (
      !actor ||
      seeded.current ||
      expenses === undefined ||
      budgets === undefined
    )
      return;
    if (expenses.length === 0) {
      seeded.current = true;
      (async () => {
        for (const cat of Object.values(Category)) {
          await actor.setBudget(cat, DEFAULT_BUDGETS[cat]);
        }
        for (const exp of SAMPLE_EXPENSES) {
          await actor.addExpense(
            exp.amount,
            exp.category,
            exp.description,
            exp.date,
          );
        }
        refetchExpenses();
        refetchBudgets();
        refetchAnalysis();
      })();
    }
  }, [
    actor,
    expenses,
    budgets,
    refetchExpenses,
    refetchBudgets,
    refetchAnalysis,
  ]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthExpenses =
    expenses?.filter((e) => e.date.startsWith(currentMonth)) ?? [];
  const totalThisMonth = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthTotal =
    expenses
      ?.filter((e) => e.date.startsWith(lastMonthStr))
      .reduce((s, e) => s + e.amount, 0) ?? 0;
  const monthChange =
    lastMonthTotal > 0
      ? ((totalThisMonth - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

  const criticalCategories =
    analysis?.categorySummaries.filter((c) => c.percentageUsed > 100) ?? [];
  const warningCategories =
    analysis?.categorySummaries.filter(
      (c) => c.percentageUsed > 80 && c.percentageUsed <= 100,
    ) ?? [];

  const healthScore = analysis?.healthScore ?? 0;
  const scoreColor =
    healthScore >= 70
      ? "text-green-400"
      : healthScore >= 40
        ? "text-yellow-400"
        : "text-red-400";
  const scoreBg =
    healthScore >= 70
      ? "stroke-green-400"
      : healthScore >= 40
        ? "stroke-yellow-400"
        : "stroke-red-400";

  const recentExpenses = [...(expenses ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const isLoading = !expenses || !budgets;

  const handleInsightClick = () => onNavigate("insights");
  const _handleInsightKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") onNavigate("insights");
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Good day!</p>
          <h1 className="text-xl font-bold text-foreground">
            {getCurrentMonthName()}
          </h1>
        </div>
        <button
          type="button"
          data-ocid="add_expense.open_modal_button"
          onClick={() => setAddOpen(true)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {criticalCategories.length > 0 && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            <strong>Over budget:</strong>{" "}
            {criticalCategories.map((c) => c.category).join(", ")}
          </p>
        </div>
      )}
      {warningCategories.length > 0 && criticalCategories.length === 0 && (
        <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-300">
            <strong>Approaching limit:</strong>{" "}
            {warningCategories.map((c) => c.category).join(", ")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Spent this month
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalThisMonth)}
              </p>
            )}
            {!isLoading && lastMonthTotal > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {monthChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                )}
                <span
                  className={`text-xs ${monthChange > 0 ? "text-red-400" : "text-green-400"}`}
                >
                  {Math.abs(monthChange).toFixed(0)}% vs last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground mb-2">Health Score</p>
            {analysisLoading ? (
              <Skeleton className="h-16 w-16 rounded-full" />
            ) : (
              <div className="relative w-16 h-16">
                <svg
                  className="w-16 h-16 -rotate-90"
                  viewBox="0 0 64 64"
                  role="img"
                  aria-label={`Health score: ${healthScore}`}
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(healthScore / 100) * 163.4} 163.4`}
                    strokeLinecap="round"
                    className={scoreBg}
                  />
                </svg>
                <span
                  className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreColor}`}
                >
                  {healthScore}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Top Categories
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("budgets")}
            className="text-xs text-primary"
          >
            See all
          </button>
        </div>
        <div className="space-y-2">
          {isLoading
            ? ["a", "b", "c"].map((k) => (
                <Skeleton key={k} className="h-14 w-full rounded-xl" />
              ))
            : (analysis?.topSpendingCategories ?? []).slice(0, 3).map((cat) => {
                const pct = Math.min(cat.percentageUsed, 100);
                const color =
                  pct > 100
                    ? "bg-red-500"
                    : pct > 80
                      ? "bg-yellow-500"
                      : pct > 60
                        ? "bg-orange-400"
                        : "bg-primary";
                return (
                  <div
                    key={cat.category}
                    className="bg-card border border-border rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {CATEGORY_ICONS[cat.category]}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {cat.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(cat.spentThisMonth)}
                        </span>
                        {cat.budgetLimit > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            / {formatCurrency(cat.budgetLimit)}
                          </span>
                        )}
                      </div>
                    </div>
                    {cat.budgetLimit > 0 && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent</h2>
          <button
            type="button"
            onClick={() => onNavigate("expenses")}
            className="text-xs text-primary"
          >
            See all
          </button>
        </div>
        <div className="space-y-2">
          {isLoading
            ? ["a", "b", "c"].map((k) => (
                <Skeleton key={k} className="h-12 w-full rounded-xl" />
              ))
            : recentExpenses.map((exp, i) => (
                <div
                  key={String(exp.id)}
                  data-ocid={`expense.item.${i + 1}`}
                  className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {CATEGORY_ICONS[exp.category]}
                    </span>
                    <div>
                      <p className="text-sm text-foreground font-medium">
                        {exp.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exp.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    -{formatCurrency(exp.amount)}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {analysis?.categorySummaries.some((c) => c.overspent) && (
        <button
          type="button"
          className="w-full text-left bg-primary/10 border border-primary/30 rounded-xl p-4 cursor-pointer"
          onClick={handleInsightClick}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">✨</span>
            <span className="text-sm font-semibold text-primary">
              AI Insight
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            You could save up to{" "}
            <strong className="text-foreground">
              {formatCurrency(analysis.savingsPotential)}/mo
            </strong>
            . Tap to see recommendations.
          </p>
        </button>
      )}

      <AddExpenseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          refetchExpenses();
          refetchAnalysis();
        }}
      />
    </div>
  );
}
