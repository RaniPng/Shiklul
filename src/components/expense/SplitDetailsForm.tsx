import type { Member, SplitMethod } from '../../types'
import { formatCurrency } from '../../utils/currency'
import Avatar from '../ui/Avatar'

interface SplitEntry {
  memberId: string;
  percentage?: number;
  shares?: number;
  customAmount?: number;
}

interface SplitDetailsFormProps {
  members: Member[];
  splitMethod: SplitMethod;
  totalAmount: number;
  splits: SplitEntry[];
  onChange: (splits: SplitEntry[]) => void;
  currency: string;
}

export default function SplitDetailsForm({
  members,
  splitMethod,
  totalAmount,
  splits,
  onChange,
  currency,
}: SplitDetailsFormProps) {
  const updateSplit = (memberId: string, field: string, value: number) => {
    const updated = splits.map((s) =>
      s.memberId === memberId ? { ...s, [field]: value } : s
    )
    onChange(updated)
  }

  const equalAmount = members.length > 0 ? totalAmount / members.length : 0

  if (splitMethod === 'equal') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">תצוגה מקדימה</label>
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Avatar name={m.name} color={m.avatarColor} size="sm" />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{m.name}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(equalAmount, currency)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (splitMethod === 'percentage') {
    const totalPct = splits.reduce((s, sp) => s + (sp.percentage ?? 0), 0)
    const isValid = Math.abs(totalPct - 100) < 0.01

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">אחוז לכל אדם</label>
        {members.map((m) => {
          const split = splits.find((s) => s.memberId === m.id)
          const pct = split?.percentage ?? 0
          const amount = totalAmount * pct / 100
          return (
            <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Avatar name={m.name} color={m.avatarColor} size="sm" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">{m.name}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={pct || ''}
                  onChange={(e) => updateSplit(m.id, 'percentage', parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-right dark:bg-gray-800 dark:text-white"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                  {formatCurrency(amount, currency)}
                </span>
              </div>
            </div>
          )
        })}
        <div className={`text-sm text-right ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          סה״כ: {totalPct.toFixed(1)}% {!isValid && '(חייב להיות 100%)'}
        </div>
      </div>
    )
  }

  if (splitMethod === 'shares') {
    const totalShares = splits.reduce((s, sp) => s + (sp.shares ?? 1), 0)

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">חלקים לכל אדם</label>
        {members.map((m) => {
          const split = splits.find((s) => s.memberId === m.id)
          const sh = split?.shares ?? 1
          const amount = totalShares > 0 ? totalAmount * sh / totalShares : 0
          return (
            <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Avatar name={m.name} color={m.avatarColor} size="sm" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">{m.name}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={sh}
                  onChange={(e) => updateSplit(m.id, 'shares', parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-right dark:bg-gray-800 dark:text-white"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                  {formatCurrency(amount, currency)}
                </span>
              </div>
            </div>
          )
        })}
        <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
          סה״כ חלקים: {totalShares}
        </div>
      </div>
    )
  }

  // Custom amounts
  const totalCustom = splits.reduce((s, sp) => s + (sp.customAmount ?? 0), 0)
  const isValid = Math.abs(totalCustom - totalAmount) < 0.01

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">סכום לכל אדם</label>
      {members.map((m) => {
        const split = splits.find((s) => s.memberId === m.id)
        return (
          <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Avatar name={m.name} color={m.avatarColor} size="sm" />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">{m.name}</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={split?.customAmount ?? ''}
              onChange={(e) => updateSplit(m.id, 'customAmount', parseFloat(e.target.value) || 0)}
              className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-right dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
            />
          </div>
        )
      })}
      <div className={`text-sm text-right ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        סה״כ: {formatCurrency(totalCustom, currency)} מתוך {formatCurrency(totalAmount, currency)}
        {!isValid && ' (חייב להתאים)'}
      </div>
    </div>
  )
}
