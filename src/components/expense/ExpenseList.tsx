import type { Expense, Member } from '../../types'
import ExpenseCard from './ExpenseCard'
import EmptyState from '../ui/EmptyState'

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  onExpenseClick?: (expense: Expense) => void;
  limit?: number;
}

export default function ExpenseList({ expenses, members, onExpenseClick, limit }: ExpenseListProps) {
  const displayed = limit ? expenses.slice(0, limit) : expenses

  if (displayed.length === 0) {
    return (
      <EmptyState
        title="אין הוצאות עדיין"
        description="הוסף את ההוצאה הראשונה שלך כדי להתחיל לעקוב."
      />
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {displayed.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          members={members}
          onClick={onExpenseClick ? () => onExpenseClick(expense) : undefined}
        />
      ))}
    </div>
  )
}
