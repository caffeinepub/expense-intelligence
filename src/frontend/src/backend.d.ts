import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Budget {
    limit: number;
    category: Category;
}
export interface SpendingAnalysis {
    categorySummaries: Array<CategorySummary>;
    savingsPotential: number;
    monthlyTrends: Array<MonthlyTrend>;
    topSpendingCategories: Array<CategorySummary>;
    healthScore: number;
}
export interface CategorySummary {
    overspent: boolean;
    budgetLimit: number;
    spentThisMonth: number;
    percentageUsed: number;
    category: Category;
}
export interface Expense {
    id: bigint;
    date: string;
    createdAt: bigint;
    description: string;
    category: Category;
    amount: number;
}
export interface MonthlyTrend {
    month: string;
    total: number;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    Food = "Food",
    Health = "Health",
    Entertainment = "Entertainment",
    Shopping = "Shopping",
    Housing = "Housing",
    Other = "Other",
    Transport = "Transport",
    Education = "Education",
    Utilities = "Utilities"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addExpense(amount: number, category: Category, description: string, date: string): Promise<bigint>;
    analyzeSpending(): Promise<SpendingAnalysis>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteExpense(id: bigint): Promise<void>;
    getBudgets(): Promise<Array<Budget>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpenses(): Promise<Array<Expense>>;
    getMonthlyTotals(year: bigint, month: bigint): Promise<Array<[Category, number]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBudget(category: Category, limit: number): Promise<void>;
    updateExpense(id: bigint, amount: number, category: Category, description: string, date: string): Promise<void>;
}
