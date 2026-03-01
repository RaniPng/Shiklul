import type { Settlement, Member } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import Avatar from '../ui/Avatar'

interface SettlementCardProps {
  settlement: Settlement;
  members: Member[];
  currency: string;
  onDelete?: () => void;
}

export default function SettlementCard({ settlement, members, currency, onDelete }: SettlementCardProps) {
  const from = members.find((m) => m.id === settlement.fromMemberId)
  const to = members.find((m) => m.id === settlement.toMemberId)

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-1">
        {from && <Avatar name={from.name} color={from.avatarColor} size="sm" />}
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        {to && <Avatar name={to.name} color={to.avatarColor} size="sm" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{from?.name}</span>
          {' שילם/ה ל'}
          <span className="font-medium">{to?.name}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(settlement.date)}</p>
        {settlement.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{settlement.note}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-green-600">
          {formatCurrency(settlement.amount, currency)}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
          title="מחיקת תשלום"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}
