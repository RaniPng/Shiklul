import { useNavigate } from 'react-router-dom'
import type { DebtEdge, Member } from '../../types'
import { formatCurrency } from '../../utils/currency'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

interface DebtListProps {
  debts: DebtEdge[];
  members: Member[];
  groupId: string;
  currency: string;
}

export default function DebtList({ debts, members, groupId, currency }: DebtListProps) {
  const navigate = useNavigate()

  if (debts.length === 0) {
    return (
      <EmptyState
        title="הכל מסולק!"
        description="אין חובות פתוחים בקבוצה זו."
        icon={
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      {debts.map((debt, i) => {
        const from = members.find((m) => m.id === debt.fromMemberId)
        const to = members.find((m) => m.id === debt.toMemberId)
        if (!from || !to) return null

        return (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Avatar name={from.name} color={from.avatarColor} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{from.name}</span>
                {' חייב/ת ל'}
                <span className="font-medium">{to.name}</span>
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {formatCurrency(debt.amount, currency)}
              </p>
            </div>
            <Avatar name={to.name} color={to.avatarColor} size="sm" />
            <Button
              size="sm"
              onClick={() =>
                navigate(
                  `/groups/${groupId}/settlements/new?from=${debt.fromMemberId}&to=${debt.toMemberId}&amount=${debt.amount}`
                )
              }
            >
              סילוק
            </Button>
          </div>
        )
      })}
    </div>
  )
}
