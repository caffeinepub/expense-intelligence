import { Category } from "../backend";

const today = new Date();
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export const SAMPLE_EXPENSES = [
  {
    amount: 42.5,
    category: Category.Food,
    description: "Grocery shopping",
    date: daysAgo(1),
  },
  {
    amount: 28.0,
    category: Category.Transport,
    description: "Uber ride to downtown",
    date: daysAgo(2),
  },
  {
    amount: 1400,
    category: Category.Housing,
    description: "Monthly rent",
    date: daysAgo(3),
  },
  {
    amount: 89.99,
    category: Category.Shopping,
    description: "Amazon order - shoes",
    date: daysAgo(4),
  },
  {
    amount: 15.5,
    category: Category.Food,
    description: "Lunch at restaurant",
    date: daysAgo(4),
  },
  {
    amount: 120,
    category: Category.Health,
    description: "Gym membership",
    date: daysAgo(5),
  },
  {
    amount: 55.0,
    category: Category.Entertainment,
    description: "Netflix + Spotify",
    date: daysAgo(6),
  },
  {
    amount: 95.0,
    category: Category.Utilities,
    description: "Electricity bill",
    date: daysAgo(7),
  },
  {
    amount: 32.0,
    category: Category.Food,
    description: "Coffee shop",
    date: daysAgo(8),
  },
  {
    amount: 45.0,
    category: Category.Transport,
    description: "Gas station fill-up",
    date: daysAgo(9),
  },
  {
    amount: 200,
    category: Category.Education,
    description: "Online course - React",
    date: daysAgo(10),
  },
  {
    amount: 78.5,
    category: Category.Food,
    description: "Dinner with friends",
    date: daysAgo(11),
  },
  {
    amount: 145.0,
    category: Category.Shopping,
    description: "Walmart - clothes",
    date: daysAgo(12),
  },
  {
    amount: 65.0,
    category: Category.Utilities,
    description: "Internet bill",
    date: daysAgo(14),
  },
  {
    amount: 22.0,
    category: Category.Entertainment,
    description: "Movie tickets",
    date: daysAgo(15),
  },
  {
    amount: 60.0,
    category: Category.Food,
    description: "Grocery store",
    date: daysAgo(18),
  },
  {
    amount: 35.0,
    category: Category.Transport,
    description: "Bus pass",
    date: daysAgo(20),
  },
  {
    amount: 50.0,
    category: Category.Health,
    description: "Pharmacy - prescriptions",
    date: daysAgo(22),
  },
  {
    amount: 125.0,
    category: Category.Shopping,
    description: "Online shopping - gadgets",
    date: daysAgo(25),
  },
  {
    amount: 18.0,
    category: Category.Food,
    description: "Pizza delivery",
    date: daysAgo(28),
  },
];
