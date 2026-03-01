import type { MemberBalance, Member } from '../../types'
import { formatCurrency } from '../../utils/currency'
import Avatar from '../ui/Avatar'

interface BalanceSummaryProps {
  memberBalances: MemberBalance[];
  members: Member[];
  currency: string;
}

export default function BalanceSummary({ memberBalances, members, currency }: BalanceSummaryProps) {
  const maxAbs = Math.max(...memberBalances.map((b) => Math.abs(b.netBalance)), 1)

  return (
    <div className="space-y-3">
      {memberBalances.map((balance) => {
        const member = members.find((m) => m.id === balance.memberId)
        if (!member) return null

        const isPositive = balance.netBalance > 0
        const isZero = Math.abs(balance.netBalance) < 0.01
        const barWidth = isZero ? 0 : (Math.abs(balance.netBalance) / maxAbs) * 100

        return (
          <div key={balance.memberId} className="flex items-center gap-3">
            <Avatar name={member.name} color={member.avatarColor} size="sm" />
            <span className="text-sm text-gray-700 dark:text-gray-300 w-24 truncate">{member.name}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all ${
                    isZero
                      ? 'bg-gray-300'
                      : isPositive
                        ? 'bg-green-400'
                        : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.max(barWidth, 2)}%` }}
                />
              </div>
              <span
                className={`text-sm font-semibold w-24 text-right ${
                  isZero ? 'text-gray-400 dark:text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isZero
                  ? 'מסולק'
                  : isPositive
                    ? `+${formatCurrency(balance.netBalance, currency)}`
                    : formatCurrency(balance.netBalance, currency)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
