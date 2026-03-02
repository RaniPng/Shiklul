import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DebtEdge, Member } from '../../types'
import { formatCurrency } from '../../utils/currency'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useSettlementStore, useUIStore } from '../../store'

interface CashSettlementCalculatorProps {
  debts: DebtEdge[];
  members: Member[];
  groupId: string;
  currency: string;
}

interface Transfer {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export default function CashSettlementCalculator({
  debts,
  members,
  groupId,
  currency,
}: CashSettlementCalculatorProps) {
  const navigate = useNavigate()
  const createSettlement = useSettlementStore((s) => s.createSettlement)
  const addToast = useUIStore((s) => s.addToast)

  // Build per-member net: negative = owes, positive = owed
  const memberNets = useMemo(() => {
    const map = new Map<string, number>()
    for (const debt of debts) {
      map.set(debt.fromMemberId, (map.get(debt.fromMemberId) ?? 0) - debt.amount)
      map.set(debt.toMemberId, (map.get(debt.toMemberId) ?? 0) + debt.amount)
    }
    return map
  }, [debts])

  const debtors = useMemo(
    () =>
      Array.from(memberNets.entries())
        .filter(([, net]) => net < 0)
        .map(([id, net]) => ({ id, owes: -net })),
    [memberNets],
  )

  const creditors = useMemo(
    () =>
      Array.from(memberNets.entries())
        .filter(([, net]) => net > 0)
        .map(([id, net]) => ({ id, owed: net })),
    [memberNets],
  )

  // Cash available per debtor
  const [cashInputs, setCashInputs] = useState<Record<string, string>>({})
  const [calculated, setCalculated] = useState(false)

  const updateCash = (memberId: string, value: string) => {
    setCashInputs((prev) => ({ ...prev, [memberId]: value }))
    setCalculated(false)
  }

  const fillAll = () => {
    const filled: Record<string, string> = {}
    for (const d of debtors) {
      filled[d.id] = d.owes.toString()
    }
    setCashInputs(filled)
    setCalculated(false)
  }

  // Calculate optimal transfers based on available cash
  const transfers = useMemo((): Transfer[] => {
    if (!calculated) return []

    // How much each debtor will actually pay (min of available cash and what they owe)
    const debtorPayments = debtors.map((d) => ({
      id: d.id,
      amount: Math.min(parseFloat(cashInputs[d.id] ?? '0') || 0, d.owes),
    })).filter((d) => d.amount > 0)

    const totalAvailable = debtorPayments.reduce((s, d) => s + d.amount, 0)
    if (totalAvailable <= 0) return []

    // How much each creditor should receive (proportional to what's available)
    const totalOwedAll = creditors.reduce((s, c) => s + c.owed, 0)
    const ratio = Math.min(totalAvailable / totalOwedAll, 1)

    const creditorReceives = creditors.map((c) => ({
      id: c.id,
      remaining: Math.round(c.owed * ratio * 100) / 100,
    }))

    // Adjust rounding so totals match
    const totalReceive = creditorReceives.reduce((s, c) => s + c.remaining, 0)
    const diff = Math.round((totalAvailable - totalReceive) * 100) / 100
    if (diff !== 0 && creditorReceives.length > 0) {
      creditorReceives[0]!.remaining += diff
    }

    // Greedy matching: pair debtors with creditors
    const result: Transfer[] = []
    const dq = debtorPayments.map((d) => ({ ...d }))
    const cq = creditorReceives.map((c) => ({ ...c }))

    let di = 0
    let ci = 0
    while (di < dq.length && ci < cq.length) {
      const debtor = dq[di]!
      const creditor = cq[ci]!
      const transfer = Math.round(Math.min(debtor.amount, creditor.remaining) * 100) / 100

      if (transfer > 0) {
        result.push({
          fromMemberId: debtor.id,
          toMemberId: creditor.id,
          amount: transfer,
        })
      }

      debtor.amount = Math.round((debtor.amount - transfer) * 100) / 100
      creditor.remaining = Math.round((creditor.remaining - transfer) * 100) / 100

      if (debtor.amount <= 0) di++
      if (creditor.remaining <= 0) ci++
    }

    return result
  }, [calculated, debtors, creditors, cashInputs])

  const handleRecordAll = () => {
    const today = new Date().toISOString().split('T')[0]!
    for (const t of transfers) {
      createSettlement({
        groupId,
        fromMemberId: t.fromMemberId,
        toMemberId: t.toMemberId,
        amount: t.amount,
        date: today,
        note: 'סילוק במזומן',
      })
    }
    addToast('כל התשלומים נרשמו בהצלחה', 'success')
    setTimeout(() => navigate(`/groups/${groupId}`), 500)
  }

  const getMember = (id: string) => members.find((m) => m.id === id)

  const totalCashEntered = debtors.reduce(
    (s, d) => s + (parseFloat(cashInputs[d.id] ?? '0') || 0),
    0,
  )
  const totalDebt = debtors.reduce((s, d) => s + d.owes, 0)

  if (debts.length === 0) return null

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        הזן כמה מזומן יש לכל חבר, והמחשבון יחשב מי צריך לשלם למי.
      </p>

      {/* Debtors list with cash inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            כמה מזומן זמין לכל חבר?
          </label>
          <button
            type="button"
            onClick={fillAll}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            מלא הכל
          </button>
        </div>

        {debtors.map((d) => {
          const member = getMember(d.id)
          if (!member) return null
          const cash = parseFloat(cashInputs[d.id] ?? '0') || 0
          const hasExcess = cash > d.owes

          return (
            <div
              key={d.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <Avatar name={member.name} color={member.avatarColor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {member.name}
                </p>
                <p className="text-xs text-red-500">
                  חייב {formatCurrency(d.owes, currency)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={cashInputs[d.id] ?? ''}
                  onChange={(e) => updateCash(d.id, e.target.value)}
                  className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {hasExcess && (
                  <span className="text-xs text-amber-500 shrink-0">מקסימום {formatCurrency(d.owes, currency)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Creditors (who is owed) */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">מגיע להם כסף:</p>
        {creditors.map((c) => {
          const member = getMember(c.id)
          if (!member) return null
          return (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <Avatar name={member.name} color={member.avatarColor} size="sm" />
              <span className="text-gray-700 dark:text-gray-300 flex-1">{member.name}</span>
              <span className="font-medium text-green-600">+{formatCurrency(c.owed, currency)}</span>
            </div>
          )
        })}
      </div>

      {/* Summary + Calculate */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          מזומן זמין: {formatCurrency(totalCashEntered, currency)} מתוך {formatCurrency(totalDebt, currency)}
        </span>
        <Button
          onClick={() => setCalculated(true)}
          disabled={totalCashEntered <= 0}
          size="sm"
        >
          חשב תוכנית
        </Button>
      </div>

      {/* Results */}
      {transfers.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            תוכנית סילוק:
          </h4>

          {totalCashEntered < totalDebt && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              המזומן הזמין לא מכסה את כל החוב. התשלומים חולקו באופן יחסי.
            </p>
          )}

          {transfers.map((t, i) => {
            const from = getMember(t.fromMemberId)
            const to = getMember(t.toMemberId)

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {from && <Avatar name={from.name} color={from.avatarColor} size="sm" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {from?.name} ישלם {formatCurrency(t.amount, currency)} ל{to?.name}
                  </p>
                </div>
                {to && <Avatar name={to.name} color={to.avatarColor} size="sm" />}
              </div>
            )
          })}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              סה״כ: {formatCurrency(transfers.reduce((s, t) => s + t.amount, 0), currency)}
            </span>
          </div>

          <Button onClick={handleRecordAll} className="w-full">
            רשום את כל התשלומים
          </Button>
        </div>
      )}

      {calculated && transfers.length === 0 && totalCashEntered <= 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          הזן סכומי מזומן כדי לחשב את תוכנית הסילוק.
        </p>
      )}
    </div>
  )
}
