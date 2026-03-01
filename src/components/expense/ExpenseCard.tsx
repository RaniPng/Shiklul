import type { Expense, Member } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  onClick?: () => void;
}

export default function ExpenseCard({ expense, members, onClick }: ExpenseCardProps) {
  const payer = members.find((m) => m.id === expense.paidByMemberId)

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
        onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
      }`}
      onClick={onClick}
    >
      {payer && <Avatar name={payer.name} color={payer.avatarColor} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.description}</p>
          {expense.parentRecurringId && <Badge variant="blue">חוזר</Badge>}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          שולם ע״י {payer?.name ?? 'לא ידוע'} &middot; {formatDate(expense.date)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(expense.amount, expense.currency)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.splitMethod} חלוקה</p>
      </div>
    </div>
  )
}
