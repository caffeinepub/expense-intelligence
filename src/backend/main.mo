import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Float "mo:core/Float";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  public type Category = {
    #Food;
    #Transport;
    #Housing;
    #Shopping;
    #Health;
    #Entertainment;
    #Utilities;
    #Education;
    #Other;
  };

  module Category {
    public func compare(c1 : Category, c2 : Category) : Order.Order {
      switch (c1, c2) {
        case (#Food, #Food) { #equal };
        case (#Food, _) { #less };
        case (#Transport, #Food) { #greater };
        case (#Transport, #Transport) { #equal };
        case (#Transport, _) { #less };
        case (#Housing, #Food) { #greater };
        case (#Housing, #Transport) { #greater };
        case (#Housing, #Housing) { #equal };
        case (#Housing, _) { #less };
        case (#Shopping, #Entertainment) { #less };
        case (#Shopping, #Other) { #less };
        case (#Shopping, #Shopping) { #equal };
        case (#Shopping, _) { #less };
        case (#Health, #Food) { #greater };
        case (#Health, #Transport) { #greater };
        case (#Health, #Housing) { #greater };
        case (#Health, #Health) { #equal };
        case (#Health, #Shopping) { #less };
        case (#Health, _) { #greater };
        case (#Entertainment, #Entertainment) { #equal };
        case (#Entertainment, #Other) { #less };
        case (#Entertainment, _) { #greater };
        case (#Utilities, #Education) { #less };
        case (#Utilities, #Health) { #greater };
        case (#Utilities, #Other) { #less };
        case (#Utilities, #Shopping) { #greater };
        case (#Utilities, #Utilities) { #equal };
        case (#Utilities, _) { #greater };
        case (#Education, #Education) { #equal };
        case (#Education, #Entertainment) { #greater };
        case (#Education, #Health) { #greater };
        case (#Education, #Other) { #less };
        case (#Education, #Shopping) { #greater };
        case (#Education, #Transport) { #greater };
        case (#Other, #Other) { #equal };
        case (#Other, _) { #greater };
      };
    };
  };

  public type Expense = {
    id : Nat;
    amount : Float;
    category : Category;
    description : Text;
    date : Text; // ISO date string
    createdAt : Int; // Timestamp
  };

  public type Budget = {
    category : Category;
    limit : Float;
  };

  public type CategorySummary = {
    category : Category;
    spentThisMonth : Float;
    budgetLimit : Float;
    percentageUsed : Float;
    overspent : Bool;
  };

  public type MonthlyTrend = {
    month : Text;
    total : Float;
  };

  public type SpendingAnalysis = {
    categorySummaries : [CategorySummary];
    topSpendingCategories : [CategorySummary];
    monthlyTrends : [MonthlyTrend];
    savingsPotential : Float;
    healthScore : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  // Expense CRUD
  module Expense {
    public func compareByCreatedAt(e1 : Expense, e2 : Expense) : Order.Order {
      Int.compare(e1.createdAt, e2.createdAt);
    };
  };

  let expenses = Map.empty<Principal, List.List<Expense>>();
  let budgets = Map.empty<Principal, Map.Map<Category, Float>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextExpenseId = 1;
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Expense CRUD Functions
  public shared ({ caller }) func addExpense(amount : Float, category : Category, description : Text, date : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add expenses");
    };

    let expense : Expense = {
      id = nextExpenseId;
      amount;
      category;
      description;
      date;
      createdAt = Time.now();
    };

    let userExpenses = switch (expenses.get(caller)) {
      case (null) { List.empty<Expense>() };
      case (?existing) { existing };
    };

    userExpenses.add(expense);
    expenses.add(caller, userExpenses);
    nextExpenseId += 1;
    expense.id;
  };

  public query ({ caller }) func getExpenses() : async [Expense] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get expenses");
    };

    switch (expenses.get(caller)) {
      case (null) {
        [];
      };
      case (?userExpenses) {
        userExpenses.toArray().sort(Expense.compareByCreatedAt);
      };
    };
  };

  public shared ({ caller }) func updateExpense(id : Nat, amount : Float, category : Category, description : Text, date : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update expenses");
    };

    let userExpenses = switch (expenses.get(caller)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?existing) { existing };
    };

    let updatedExpenses = userExpenses.map<Expense, Expense>(
      func(e) {
        if (e.id == id) {
          return {
            id;
            amount;
            category;
            description;
            date;
            createdAt = e.createdAt;
          };
        } else { e };
      }
    );

    expenses.add(caller, updatedExpenses);
  };

  public shared ({ caller }) func deleteExpense(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete expenses");
    };

    let userExpenses = switch (expenses.get(caller)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?existing) { existing };
    };

    let filteredExpenses = userExpenses.filter(func(e) { e.id != id });

    expenses.add(caller, filteredExpenses);
  };

  // Budget CRUD Functions
  public shared ({ caller }) func setBudget(category : Category, limit : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can set budgets");
    };

    let userBudgets = switch (budgets.get(caller)) {
      case (null) { Map.empty<Category, Float>() };
      case (?existing) { existing };
    };

    userBudgets.add(category, limit);
    budgets.add(caller, userBudgets);
  };

  public query ({ caller }) func getBudgets() : async [Budget] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get budgets");
    };

    switch (budgets.get(caller)) {
      case (null) {
        [];
      };
      case (?userBudgets) {
        userBudgets.entries().map(
          func((category, limit)) {
            {
              category;
              limit;
            };
          }
        ).toArray();
      };
    };
  };

  // Aggregation Functions
  public query ({ caller }) func getMonthlyTotals(year : Nat, month : Nat) : async [(Category, Float)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get monthly totals");
    };

    let categoryTotals = Map.empty<Category, Float>();

    switch (expenses.get(caller)) {
      case (null) { Runtime.trap("No expenses found") };
      case (?userExpenses) {
        userExpenses.forEach(
          func(expense) {
            categoryTotals.add(expense.category, 0.0);
          }
        );

        userExpenses.forEach(
          func(expense) {
            let currentTotal = switch (categoryTotals.get(expense.category)) {
              case (null) { 0.0 };
              case (?total) { total };
            };
            categoryTotals.add(expense.category, currentTotal + expense.amount);
          }
        );
      };
    };

    categoryTotals.entries().toArray();
  };

  // AI Spending Analysis
  public query ({ caller }) func analyzeSpending() : async SpendingAnalysis {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can analyze spending");
    };

    let categorySummaries = Map.empty<Category, CategorySummary>();
    let topSpendingCategories = List.empty<CategorySummary>();
    let monthlyTrends = List.empty<MonthlyTrend>();

    switch (expenses.get(caller)) {
      case (null) { Runtime.trap("No expenses found") };
      case (?userExpenses) {
        userExpenses.forEach(
          func(expense) {
            categorySummaries.add(
              expense.category,
              {
                category = expense.category;
                spentThisMonth = expense.amount;
                budgetLimit = 0.0;
                percentageUsed = 0.0;
                overspent = false;
              },
            );
          }
        );

        userExpenses.forEach(
          func(expense) {
            topSpendingCategories.add(
              {
                category = expense.category;
                spentThisMonth = expense.amount;
                budgetLimit = 0.0;
                percentageUsed = 0.0;
                overspent = false;
              },
            );
          }
        );

        userExpenses.forEach(
          func(expense) {
            monthlyTrends.add(
              {
                month = expense.date;
                total = expense.amount;
              },
            );
          }
        );
      };
    };

    {
      categorySummaries = switch (categorySummaries.values().toArray()) {
        case (categorySummaries) { categorySummaries };
      };
      topSpendingCategories = switch (topSpendingCategories.toArray()) {
        case (categories) {
          categories;
        };
      };
      monthlyTrends = switch (monthlyTrends.toArray()) {
        case (monthlyTrends) { monthlyTrends };
      };
      savingsPotential = 0.0;
      healthScore = 0.0;
    };
  };
};
