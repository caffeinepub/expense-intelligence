import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Category, type Expense } from "../backend";
import { useActor } from "../hooks/useActor";
import { CATEGORY_ICONS, detectCategory } from "../lib/categories";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editExpense?: Expense | null;
}

export function AddExpenseModal({
  open,
  onClose,
  onSaved,
  editExpense,
}: Props) {
  const { actor } = useActor();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(Category.Other);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (open) {
      if (editExpense) {
        setAmount(String(editExpense.amount));
        setDescription(editExpense.description);
        setCategory(editExpense.category);
        setDate(editExpense.date);
      } else {
        setAmount("");
        setDescription("");
        setCategory(Category.Other);
        setDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [open, editExpense]);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (val.length > 2) {
      setCategory(detectCategory(val));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const amt = Number.parseFloat(amount);
      if (editExpense) {
        await actor.updateExpense(
          editExpense.id,
          amt,
          category,
          description,
          date,
        );
      } else {
        await actor.addExpense(amt, category, description, date);
      }
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  const isValid = amount && Number.parseFloat(amount) > 0 && description.trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>
            {editExpense ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount ($)</Label>
            <Input
              data-ocid="add_expense.amount.input"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              data-ocid="add_expense.description.input"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
            >
              <SelectTrigger data-ocid="add_expense.category.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Category).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input
              data-ocid="add_expense.date.input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-ocid="add_expense.cancel_button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="add_expense.submit_button"
              className="flex-1"
              onClick={() => saveMutation.mutate()}
              disabled={!isValid || saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Saving..."
                : editExpense
                  ? "Update"
                  : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
