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

interface RepaymentStep {
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

  const [selectedDebtor, setSelectedDebtor] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [recorded, setRecorded] = useState(false)

  // Get unique debtors from the simplified debts
  const debtors = useMemo(() => {
    const debtorMap = new Map<string, number>()
    for (const debt of debts) {
      debtorMap.set(debt.fromMemberId, (debtorMap.get(debt.fromMemberId) ?? 0) + debt.amount)
    }
    return Array.from(debtorMap.entries()).map(([id, total]) => ({ id, total }))
  }, [debts])

  // Get debts for the selected debtor
  const debtorDebts = useMemo(() => {
    if (!selectedDebtor) return []
    return debts.filter((d) => d.fromMemberId === selectedDebtor)
  }, [debts, selectedDebtor])

  const totalOwed = debtorDebts.reduce((sum, d) => sum + d.amount, 0)
  const parsedCash = parseFloat(cashAmount) || 0

  // Calculate optimized repayment plan
  const repaymentPlan = useMemo((): RepaymentStep[] => {
    if (!selectedDebtor || parsedCash <= 0 || debtorDebts.length === 0) return []

    const available = Math.min(parsedCash, totalOwed)
    const sorted = [...debtorDebts].sort((a, b) => a.amount - b.amount)

    const plan: RepaymentStep[] = []
    let remaining = available

    if (parsedCash >= totalOwed) {
      // Full settlement - pay everyone exactly what's owed
      for (const debt of sorted) {
        plan.push({ toMemberId: debt.toMemberId, amount: debt.amount })
      }
    } else {
      // Partial settlement - prioritize settling smaller debts first, then distribute remainder
      for (const debt of sorted) {
        if (remaining <= 0) break
        const payment = Math.min(debt.amount, remaining)
        if (payment > 0) {
          plan.push({ toMemberId: debt.toMemberId, amount: Math.round(payment * 100) / 100 })
          remaining -= payment
        }
      }
    }

    return plan
  }, [selectedDebtor, parsedCash, debtorDebts, totalOwed])

  const handleRecordAll = () => {
    const today = new Date().toISOString().split('T')[0]!
    for (const step of repaymentPlan) {
      createSettlement({
        groupId,
        fromMemberId: selectedDebtor,
        toMemberId: step.toMemberId,
        amount: step.amount,
        date: today,
        note: 'סילוק במזומן',
      })
    }
    addToast('כל התשלומים נרשמו בהצלחה', 'success')
    setRecorded(true)
    setCashAmount('')
    setSelectedDebtor('')
    // Navigate to refresh the page state
    setTimeout(() => navigate(`/groups/${groupId}`), 500)
  }

  const getMember = (id: string) => members.find((m) => m.id === id)

  if (debts.length === 0) return null

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        בחר חבר שרוצה לשלם במזומן וחשב כמה לשלם לכל אחד.
      </p>

      {/* Debtor Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          מי משלם?
        </label>
        <select
          value={selectedDebtor}
          onChange={(e) => {
            setSelectedDebtor(e.target.value)
            setCashAmount('')
            setRecorded(false)
          }}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">בחר חבר</option>
          {debtors.map((d) => {
            const member = getMember(d.id)
            return (
              <option key={d.id} value={d.id}>
                {member?.name ?? d.id} (חייב {formatCurrency(d.total, currency)})
              </option>
            )
          })}
        </select>
      </div>

      {/* Show debtor's debts breakdown */}
      {selectedDebtor && debtorDebts.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            חובות של {getMember(selectedDebtor)?.name}:
          </p>
          {debtorDebts.map((debt, i) => {
            const to = getMember(debt.toMemberId)
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                {to && <Avatar name={to.name} color={to.avatarColor} size="sm" />}
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrency(debt.amount, currency)} ל{to?.name}
                </span>
              </div>
            )
          })}
          <div className="pt-1 border-t border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white">
            סה״כ: {formatCurrency(totalOwed, currency)}
          </div>
        </div>
      )}

      {/* Cash Amount Input */}
      {selectedDebtor && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            כמה מזומן זמין?
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            value={cashAmount}
            onChange={(e) => {
              setCashAmount(e.target.value)
              setRecorded(false)
            }}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {totalOwed > 0 && (
            <button
              type="button"
              onClick={() => setCashAmount(totalOwed.toString())}
              className="mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              מלא את כל החוב ({formatCurrency(totalOwed, currency)})
            </button>
          )}
        </div>
      )}

      {/* Repayment Plan */}
      {repaymentPlan.length > 0 && !recorded && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            תוכנית תשלום:
          </h4>

          {parsedCash < totalOwed && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              הסכום לא מכסה את כל החוב. התשלומים יחולקו לפי עדיפות.
            </p>
          )}

          {repaymentPlan.map((step, i) => {
            const to = getMember(step.toMemberId)
            const originalDebt = debtorDebts.find((d) => d.toMemberId === step.toMemberId)
            const isPartial = originalDebt && step.amount < originalDebt.amount

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {to && <Avatar name={to.name} color={to.avatarColor} size="sm" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      שלם {formatCurrency(step.amount, currency)} ל{to?.name}
                    </p>
                    {isPartial && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        (תשלום חלקי מתוך {formatCurrency(originalDebt.amount, currency)})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              סה״כ לתשלום: {formatCurrency(repaymentPlan.reduce((s, p) => s + p.amount, 0), currency)}
            </span>
            {parsedCash > totalOwed && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                עודף: {formatCurrency(parsedCash - totalOwed, currency)}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRecordAll} className="flex-1">
              רשום את כל התשלומים
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
