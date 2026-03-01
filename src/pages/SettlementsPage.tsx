import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroupStore, useSettlementStore, useUIStore } from '../store'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SettlementList from '../components/settlement/SettlementList'

export default function SettlementsPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const loadSettlements = useSettlementStore((s) => s.loadSettlements)
  const settlements = useSettlementStore((s) => s.settlementsByGroup[groupId!] ?? [])
  const deleteSettlement = useSettlementStore((s) => s.deleteSettlement)
  const addToast = useUIStore((s) => s.addToast)

  useEffect(() => {
    if (groupId) loadSettlements(groupId)
  }, [groupId, loadSettlements])

  if (!group) {
    return (
      <div>
        <Header title="הקבוצה לא נמצאה" />
        <div className="p-6"><p className="text-gray-500 dark:text-gray-400">קבוצה זו לא קיימת.</p></div>
      </div>
    )
  }

  return (
    <div>
      <Header title="תשלומים" />
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name} - תשלומים</h2>
          <Button onClick={() => navigate(`/groups/${groupId}/settlements/new`)}>
            תיעוד תשלום
          </Button>
        </div>

        <Card>
          <SettlementList
            settlements={settlements}
            members={group.members}
            currency={group.currency}
            onDelete={(id) => {
              deleteSettlement(id, groupId!)
              addToast('התשלום נמחק', 'success')
            }}
          />
        </Card>
      </div>
    </div>
  )
}
