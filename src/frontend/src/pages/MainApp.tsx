import { Home, ListIcon, PiggyBank, Sparkles } from "lucide-react";
import { useState } from "react";
import { BudgetsPage } from "./BudgetsPage";
import { DashboardPage } from "./DashboardPage";
import { ExpensesPage } from "./ExpensesPage";
import { InsightsPage } from "./InsightsPage";
import type { Tab } from "./MainAppTypes";

const tabs = [
  { id: "dashboard" as Tab, label: "Home", icon: Home },
  { id: "expenses" as Tab, label: "Expenses", icon: ListIcon },
  { id: "budgets" as Tab, label: "Budgets", icon: PiggyBank },
  { id: "insights" as Tab, label: "Insights", icon: Sparkles },
];

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto pb-20">
        <div className="max-w-[480px] mx-auto">
          {activeTab === "dashboard" && (
            <DashboardPage onNavigate={setActiveTab} />
          )}
          {activeTab === "expenses" && <ExpensesPage />}
          {activeTab === "budgets" && <BudgetsPage />}
          {activeTab === "insights" && <InsightsPage />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-[480px] mx-auto flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.tab`}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
