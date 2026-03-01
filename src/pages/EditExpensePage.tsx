import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroupStore, useExpenseStore, useUIStore } from '../store'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ExpenseForm from '../components/expense/ExpenseForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useState } from 'react'

export default function EditExpensePage() {
  const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>()
  const navigate = useNavigate()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const loadExpenses = useExpenseStore((s) => s.loadExpenses)
  const expenses = useExpenseStore((s) => s.expensesByGroup[groupId!] ?? [])
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)
  const addToast = useUIStore((s) => s.addToast)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (groupId) loadExpenses(groupId)
  }, [groupId, loadExpenses])

  const expense = expenses.find((e) => e.id === expenseId)

  if (!group || !expense) {
    return (
      <div>
        <Header title="לא נמצא" />
        <div className="p-6"><p className="text-gray-500 dark:text-gray-400">ההוצאה לא נמצאה.</p></div>
      </div>
    )
  }

  return (
    <div>
      <Header title="עריכת הוצאה" />
      <div className="p-4 lg:p-6 max-w-2xl">
        <Card className="p-6">
          <ExpenseForm
            groupId={groupId!}
            members={group.members}
            currency={group.currency}
            initial={expense}
            onSubmit={(input) => {
              updateExpense(expenseId!, {
                description: input.description,
                amount: input.amount,
                date: input.date,
                paidByMemberId: input.paidByMemberId,
                splitMethod: input.splitMethod,
                splits: input.splits,
              })
              addToast('ההוצאה עודכנה', 'success')
              navigate(`/groups/${groupId}`)
            }}
            onCancel={() => navigate(`/groups/${groupId}`)}
          />
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              מחיקת הוצאה
            </Button>
          </div>
        </Card>

        <ConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            deleteExpense(expenseId!, groupId!)
            addToast('ההוצאה נמחקה', 'success')
            navigate(`/groups/${groupId}`)
          }}
          title="מחיקת הוצאה"
          message="האם אתה בטוח שברצונך למחוק הוצאה זו? לא ניתן לבטל פעולה זו."
          confirmLabel="מחיקה"
        />
      </div>
    </div>
  )
}
