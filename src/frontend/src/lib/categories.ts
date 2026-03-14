import { Category } from "../backend";

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Food]: "#f97316",
  [Category.Transport]: "#3b82f6",
  [Category.Housing]: "#8b5cf6",
  [Category.Shopping]: "#ec4899",
  [Category.Health]: "#22c55e",
  [Category.Entertainment]: "#f59e0b",
  [Category.Utilities]: "#06b6d4",
  [Category.Education]: "#6366f1",
  [Category.Other]: "#6b7280",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  [Category.Food]: "🍔",
  [Category.Transport]: "🚗",
  [Category.Housing]: "🏠",
  [Category.Shopping]: "🛍️",
  [Category.Health]: "❤️",
  [Category.Entertainment]: "🎬",
  [Category.Utilities]: "⚡",
  [Category.Education]: "📚",
  [Category.Other]: "📦",
};

export const DEFAULT_BUDGETS: Record<Category, number> = {
  [Category.Food]: 600,
  [Category.Transport]: 300,
  [Category.Housing]: 1500,
  [Category.Shopping]: 400,
  [Category.Health]: 200,
  [Category.Entertainment]: 150,
  [Category.Utilities]: 250,
  [Category.Education]: 200,
  [Category.Other]: 100,
};

export function detectCategory(description: string): Category {
  const lower = description.toLowerCase();
  if (
    /food|restaurant|cafe|coffee|lunch|dinner|breakfast|grocery|pizza|burger|sushi|taco|sandwich|meal|eat|snack|drink|bar/.test(
      lower,
    )
  )
    return Category.Food;
  if (
    /uber|lyft|gas|parking|bus|train|subway|taxi|metro|fuel|toll|car|bike|scooter/.test(
      lower,
    )
  )
    return Category.Transport;
  if (
    /rent|mortgage|electricity|water|internet|phone|cable|insurance|hoa/.test(
      lower,
    )
  ) {
    if (/electricity|water|internet|phone|cable/.test(lower))
      return Category.Utilities;
    return Category.Housing;
  }
  if (
    /amazon|shopping|clothes|shoes|store|mall|walmart|target|fashion|outfit|buy/.test(
      lower,
    )
  )
    return Category.Shopping;
  if (
    /doctor|pharmacy|gym|medicine|hospital|dental|health|medical|fitness|workout/.test(
      lower,
    )
  )
    return Category.Health;
  if (
    /movie|netflix|spotify|game|concert|theater|cinema|music|stream|hulu|disney/.test(
      lower,
    )
  )
    return Category.Entertainment;
  if (/electric|water|gas bill|internet|utility|utilities/.test(lower))
    return Category.Utilities;
  if (
    /school|course|book|tuition|class|learn|education|university|college/.test(
      lower,
    )
  )
    return Category.Education;
  return Category.Other;
}

export const ALL_CATEGORIES = Object.values(Category);
