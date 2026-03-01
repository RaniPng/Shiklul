import type { Settlement, Member } from '../../types'
import SettlementCard from './SettlementCard'
import EmptyState from '../ui/EmptyState'

interface SettlementListProps {
  settlements: Settlement[];
  members: Member[];
  currency: string;
  onDelete?: (settlementId: string) => void;
}

export default function SettlementList({ settlements, members, currency, onDelete }: SettlementListProps) {
  if (settlements.length === 0) {
    return (
      <EmptyState
        title="אין תשלומים עדיין"
        description="תעד תשלומים בין חברי הקבוצה כדי לסגור חובות."
      />
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {settlements.map((settlement) => (
        <SettlementCard
          key={settlement.id}
          settlement={settlement}
          members={members}
          currency={currency}
          onDelete={onDelete ? () => onDelete(settlement.id) : undefined}
        />
      ))}
    </div>
  )
}
