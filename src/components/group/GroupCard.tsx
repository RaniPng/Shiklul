import { useNavigate } from 'react-router-dom'
import type { Group } from '../../types'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import { formatCurrency } from '../../utils/currency'
import { balanceService } from '../../services/balanceService'

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate()

  let totalOwed = 0
  try {
    const balances = balanceService.calculateGroupBalances(group.id)
    totalOwed = balances.simplifiedDebts.reduce((sum, d) => sum + d.amount, 0)
  } catch {
    // Group may not have members yet
  }

  return (
    <Card className="p-5" onClick={() => navigate(`/groups/${group.id}`)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{group.description}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
          {group.members.length} חברים
        </span>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {group.members.slice(0, 5).map((member) => (
          <Avatar key={member.id} name={member.name} color={member.avatarColor} size="sm" />
        ))}
        {group.members.length > 5 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">+{group.members.length - 5}</span>
        )}
      </div>

      {totalOwed > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatCurrency(totalOwed, group.currency)} בחובות פתוחים
        </div>
      )}
    </Card>
  )
}
