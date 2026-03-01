import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroupStore, useExpenseStore } from '../store'
import { expenseService } from '../services/expenseService'
import type { ExpenseFilter } from '../types'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ExpenseList from '../components/expense/ExpenseList'
import MemberSelect from '../components/member/MemberSelect'

export default function ExpenseHistoryPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const loadExpenses = useExpenseStore((s) => s.loadExpenses)

  const [search, setSearch] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (groupId) loadExpenses(groupId)
  }, [groupId, loadExpenses])

  if (!group) {
    return (
      <div>
        <Header title="הקבוצה לא נמצאה" />
        <div className="p-6"><p className="text-gray-500 dark:text-gray-400">קבוצה זו לא קיימת.</p></div>
      </div>
    )
  }

  const filter: ExpenseFilter = {}
  if (search) filter.searchQuery = search
  if (paidBy) filter.paidByMemberId = paidBy
  if (startDate) filter.startDate = startDate
  if (endDate) filter.endDate = endDate

  const filteredExpenses = expenseService.getExpensesByGroup(groupId!, filter)

  return (
    <div>
      <Header title="היסטוריית הוצאות" />
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name} - הוצאות</h2>
          <Button onClick={() => navigate(`/groups/${groupId}/expenses/new`)}>
            הוספת הוצאה
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="חיפוש הוצאות..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <MemberSelect
              members={group.members}
              value={paidBy}
              onChange={setPaidBy}
              label=""
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
            />
          </div>
          {(search || paidBy || startDate || endDate) && (
            <button
              onClick={() => { setSearch(''); setPaidBy(''); setStartDate(''); setEndDate('') }}
              className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              ניקוי מסננים
            </button>
          )}
        </Card>

        <Card>
          <ExpenseList
            expenses={filteredExpenses}
            members={group.members}
            onExpenseClick={(e) => navigate(`/groups/${groupId}/expenses/${e.id}/edit`)}
          />
        </Card>
      </div>
    </div>
  )
}
