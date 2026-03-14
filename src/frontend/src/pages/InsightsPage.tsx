import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Category, type SpendingAnalysis } from "../backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/categories";
import { formatCurrency } from "../lib/utils";

type Severity = "critical" | "warning" | "tip";
interface Rec {
  icon: string;
  title: string;
  body: string;
  severity: Severity;
}

function getRecommendations(analysis: SpendingAnalysis): Rec[] {
  const recs: Rec[] = [];

  for (const cat of analysis.categorySummaries) {
    if (cat.overspent) {
      const over = cat.spentThisMonth - cat.budgetLimit;
      recs.push({
        icon: CATEGORY_ICONS[cat.category],
        title: `${cat.category} over budget`,
        body: `You're ${formatCurrency(over)} over your ${formatCurrency(cat.budgetLimit)} budget for ${cat.category}. Review recent transactions to cut back.`,
        severity: "critical",
      });
    } else if (cat.percentageUsed > 80 && cat.budgetLimit > 0) {
      const remaining = cat.budgetLimit - cat.spentThisMonth;
      recs.push({
        icon: CATEGORY_ICONS[cat.category],
        title: `${cat.category} nearing limit`,
        body: `Only ${formatCurrency(remaining)} left in your ${cat.category} budget. Slow down to stay within limits.`,
        severity: "warning",
      });
    }
  }

  const topCat = analysis.topSpendingCategories[0];
  if (topCat?.category === Category.Food) {
    recs.push({
      icon: "🍳",
      title: "Meal prep to save on food",
      body: "Cooking at home just 3 extra days/week can cut food costs by 30-40%. Batch cooking on weekends is a great start.",
      severity: "tip",
    });
  }
  if (
    analysis.topSpendingCategories.some(
      (c) => c.category === Category.Entertainment,
    )
  ) {
    recs.push({
      icon: "📺",
      title: "Audit subscriptions",
      body: "Review streaming and subscription services. Sharing family plans or rotating services each month can save $30-50/month.",
      severity: "tip",
    });
  }
  if (
    analysis.topSpendingCategories.some((c) => c.category === Category.Shopping)
  ) {
    recs.push({
      icon: "⏳",
      title: "Use the 24-hour rule for shopping",
      body: "Wait 24 hours before any non-essential purchase over $20. This alone reduces impulse buying by up to 50%.",
      severity: "tip",
    });
  }
  if (analysis.savingsPotential > 0) {
    recs.push({
      icon: "💰",
      title: `Save ${formatCurrency(analysis.savingsPotential)}/month`,
      body: "Based on your spending patterns, you have significant savings potential. Consider automating transfers to savings each payday.",
      severity: "tip",
    });
  }

  return recs.slice(0, 6);
}

export function InsightsPage() {
  const { actor } = useActor();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["analysis"],
    queryFn: () => actor!.analyzeSpending(),
    enabled: !!actor,
  });

  const healthScore = analysis?.healthScore ?? 0;
  const scoreColor =
    healthScore >= 70 ? "#22c55e" : healthScore >= 40 ? "#f59e0b" : "#ef4444";
  const scoreBgClass =
    healthScore >= 70
      ? "stroke-green-400"
      : healthScore >= 40
        ? "stroke-yellow-400"
        : "stroke-red-400";
  const scoreLabel =
    healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Fair" : "Needs Work";

  const pieData = (analysis?.categorySummaries ?? [])
    .filter((c) => c.spentThisMonth > 0)
    .map((c) => ({
      name: c.category,
      value: c.spentThisMonth,
      color: CATEGORY_COLORS[c.category],
    }));

  const barData = (analysis?.monthlyTrends ?? []).map((t) => ({
    name: t.month.length > 7 ? t.month.slice(5) : t.month,
    total: t.total,
  }));

  const recommendations = analysis ? getRecommendations(analysis) : [];

  const severityColor: Record<Severity, string> = {
    critical: "border-red-500/30 bg-red-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
    tip: "border-primary/20 bg-primary/5",
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold text-foreground">AI Insights</h1>

      <Card
        data-ocid="insight.health_score.card"
        className="bg-card border-border"
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-full" />
            ) : (
              <div className="relative w-20 h-20 shrink-0">
                <svg
                  className="w-20 h-20 -rotate-90"
                  viewBox="0 0 80 80"
                  role="img"
                  aria-label={`Spending health score: ${healthScore}`}
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    strokeWidth="7"
                    stroke="currentColor"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={`${(healthScore / 100) * 201} 201`}
                    strokeLinecap="round"
                    className={scoreBgClass}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xl font-bold"
                  style={{ color: scoreColor }}
                >
                  {healthScore}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Spending Health</p>
              {isLoading ? (
                <Skeleton className="h-6 w-20 mt-1" />
              ) : (
                <>
                  <p
                    className="text-xl font-bold"
                    style={{ color: scoreColor }}
                  >
                    {scoreLabel}
                  </p>
                  {(analysis?.savingsPotential ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Potential savings:{" "}
                      <strong className="text-foreground">
                        {formatCurrency(analysis!.savingsPotential)}/mo
                      </strong>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div data-ocid="insight.recommendations.list">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Recommendations
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {["a", "b", "c"].map((k) => (
              <Skeleton key={k} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm">Great job! Your spending looks healthy.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.title}
                className={`border rounded-xl p-3 ${severityColor[rec.severity]}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">{rec.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {rec.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rec.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pieData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {pieData.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {barData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={barData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar
                  dataKey="total"
                  fill="oklch(0.65 0.22 265)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Top Spending Categories
          </h2>
          <div className="space-y-2">
            {analysis.topSpendingCategories.slice(0, 5).map((cat, i) => (
              <div
                key={cat.category}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5"
              >
                <span className="text-sm font-bold text-muted-foreground w-4">
                  #{i + 1}
                </span>
                <span className="text-base">
                  {CATEGORY_ICONS[cat.category]}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {cat.category}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(cat.spentThisMonth)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
