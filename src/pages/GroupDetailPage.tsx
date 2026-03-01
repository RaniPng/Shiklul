import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGroupStore, useExpenseStore, useSettlementStore, useUIStore } from '../store'
import { balanceService } from '../services/balanceService'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import BalanceSummary from '../components/balance/BalanceSummary'
import DebtList from '../components/balance/DebtList'
import CashSettlementCalculator from '../components/balance/CashSettlementCalculator'
import ExpenseList from '../components/expense/ExpenseList'
import Modal from '../components/ui/Modal'
import MemberForm from '../components/member/MemberForm'
import { useState } from 'react'

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const addMember = useGroupStore((s) => s.addMember)
  const loadExpenses = useExpenseStore((s) => s.loadExpenses)
  const loadSettlements = useSettlementStore((s) => s.loadSettlements)
  const expenses = useExpenseStore((s) => s.expensesByGroup[groupId!] ?? [])
  const addToast = useUIStore((s) => s.addToast)
  const [showMemberForm, setShowMemberForm] = useState(false)

  useEffect(() => {
    if (groupId) {
      loadExpenses(groupId)
      loadSettlements(groupId)
    }
  }, [groupId, loadExpenses, loadSettlements])

  if (!group) {
    return (
      <div>
        <Header title="הקבוצה לא נמצאה" />
        <div className="p-6"><p className="text-gray-500 dark:text-gray-400">קבוצה זו לא קיימת.</p></div>
      </div>
    )
  }

  if (group.members.length === 0) {
    return (
      <div>
        <Header title={group.name} />
        <div className="p-4 lg:p-6">
          <EmptyState
            title="הוסף חברים כדי להתחיל"
            description="צריך לפחות 2 חברים כדי להתחיל לעקוב אחרי הוצאות."
            action={
              <div className="flex gap-2">
                <Button onClick={() => setShowMemberForm(true)}>הוספת חברים</Button>
                <Button variant="secondary" onClick={() => navigate(`/groups/${groupId}/settings`)}>
                  הגדרות קבוצה
                </Button>
              </div>
            }
          />
          <Modal open={showMemberForm} onClose={() => setShowMemberForm(false)} title="הוספת חבר">
            <MemberForm
              onSubmit={(input) => {
                addMember(groupId!, input)
                setShowMemberForm(false)
                addToast('חבר נוסף', 'success')
              }}
              onCancel={() => setShowMemberForm(false)}
            />
          </Modal>
        </div>
      </div>
    )
  }

  let balances = null
  try {
    balances = balanceService.calculateGroupBalances(groupId!)
  } catch {
    // Handle gracefully
  }

  return (
    <div>
      <Header title={group.name} />
      <div className="p-4 lg:p-6">
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button onClick={() => navigate(`/groups/${groupId}/expenses/new`)}>
            <svg className="w-4 h-4 me-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            הוספת הוצאה
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/groups/${groupId}/settlements/new`)}>
            סילוק חוב
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/groups/${groupId}/expenses`)}>
              כל ההוצאות
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/groups/${groupId}/settlements`)}>
              תשלומים
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/groups/${groupId}/settings`)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balances */}
          {balances && (
            <Card className="p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">יתרות</h3>
              <BalanceSummary
                memberBalances={balances.memberBalances}
                members={group.members}
                currency={group.currency}
              />
            </Card>
          )}

          {/* Simplified Debts */}
          {balances && (
            <Card className="p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">מי חייב למי</h3>
              <DebtList
                debts={balances.simplifiedDebts}
                members={group.members}
                groupId={groupId!}
                currency={group.currency}
              />
            </Card>
          )}
        </div>

        {/* Cash Settlement Calculator */}
        {balances && balances.simplifiedDebts.length > 0 && (
          <Card className="mt-6 p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                מחשבון סילוק במזומן
              </span>
            </h3>
            <CashSettlementCalculator
              debts={balances.simplifiedDebts}
              members={group.members}
              groupId={groupId!}
              currency={group.currency}
            />
          </Card>
        )}

        {/* Recent Expenses */}
        <Card className="mt-6">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">הוצאות אחרונות</h3>
            {expenses.length > 5 && (
              <Link
                to={`/groups/${groupId}/expenses`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                הצג הכל
              </Link>
            )}
          </div>
          <div className="px-2">
            <ExpenseList
              expenses={expenses}
              members={group.members}
              onExpenseClick={(e) => navigate(`/groups/${groupId}/expenses/${e.id}/edit`)}
              limit={5}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
