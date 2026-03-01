import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useGroupStore, useSettlementStore, useUIStore } from '../store'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import SettlementForm from '../components/settlement/SettlementForm'

export default function AddSettlementPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const createSettlement = useSettlementStore((s) => s.createSettlement)
  const addToast = useUIStore((s) => s.addToast)

  if (!group) {
    return (
      <div>
        <Header title="הקבוצה לא נמצאה" />
        <div className="p-6"><p className="text-gray-500 dark:text-gray-400">קבוצה זו לא קיימת.</p></div>
      </div>
    )
  }

  const defaultFrom = searchParams.get('from') ?? ''
  const defaultTo = searchParams.get('to') ?? ''
  const defaultAmount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : undefined

  return (
    <div>
      <Header title="תיעוד תשלום" />
      <div className="p-4 lg:p-6 max-w-md">
        <Card className="p-6">
          <SettlementForm
            groupId={groupId!}
            members={group.members}
            onSubmit={(input) => {
              createSettlement(input)
              addToast('התשלום נרשם', 'success')
              navigate(`/groups/${groupId}`)
            }}
            onCancel={() => navigate(`/groups/${groupId}`)}
            defaultFrom={defaultFrom}
            defaultTo={defaultTo}
            defaultAmount={defaultAmount}
          />
        </Card>
      </div>
    </div>
  )
}
