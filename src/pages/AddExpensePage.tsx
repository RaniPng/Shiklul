import { useParams, useNavigate } from 'react-router-dom'
import { useGroupStore, useExpenseStore, useUIStore } from '../store'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import ExpenseForm from '../components/expense/ExpenseForm'

export default function AddExpensePage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const createExpense = useExpenseStore((s) => s.createExpense)
  const addToast = useUIStore((s) => s.addToast)

  if (!group) {
    return (
      <div>
        <Header title="הקבוצה לא נמצאה" />
        <div className="p-6"><p className="text-gray-500 dark:text-gray-400">קבוצה זו לא קיימת.</p></div>
      </div>
    )
  }

  if (group.members.length < 2) {
    return (
      <div>
        <Header title="הוספת הוצאה" />
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400">
            צריך לפחות 2 חברים בקבוצה כדי להוסיף הוצאה.{' '}
            <a href={`/groups/${groupId}/settings`} className="text-primary-600 dark:text-primary-400 hover:underline">
              הוסף חברים
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="הוספת הוצאה" />
      <div className="p-4 lg:p-6 max-w-2xl">
        <Card className="p-6">
          <ExpenseForm
            groupId={groupId!}
            members={group.members}
            currency={group.currency}
            onSubmit={(input) => {
              createExpense(input)
              addToast('הוצאה נוספה', 'success')
              navigate(`/groups/${groupId}`)
            }}
            onCancel={() => navigate(`/groups/${groupId}`)}
          />
        </Card>
      </div>
    </div>
  )
}
