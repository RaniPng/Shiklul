import { useState } from 'react'
import type { Member, SplitMethod, ExpenseCreateInput, RecurringFrequency, Expense } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import MemberSelect from '../member/MemberSelect'
import SplitMethodSelector from './SplitMethodSelector'
import SplitDetailsForm from './SplitDetailsForm'
import RecurringConfigComponent from './RecurringConfig'
import { toISODate } from '../../utils/date'

interface SplitEntry {
  memberId: string;
  percentage?: number;
  shares?: number;
  customAmount?: number;
}

interface ExpenseFormProps {
  groupId: string;
  members: Member[];
  currency: string;
  onSubmit: (input: ExpenseCreateInput) => void;
  onCancel: () => void;
  initial?: Expense;
}

export default function ExpenseForm({
  groupId,
  members,
  currency,
  onSubmit,
  onCancel,
  initial,
}: ExpenseFormProps) {
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '')
  const [date, setDate] = useState(initial?.date ?? toISODate())
  const [paidBy, setPaidBy] = useState(initial?.paidByMemberId ?? (members[0]?.id ?? ''))
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(initial?.splitMethod ?? 'equal')
  const [splits, setSplits] = useState<SplitEntry[]>(
    members.map((m) => {
      const existing = initial?.splits.find((s) => s.memberId === m.id)
      return {
        memberId: m.id,
        percentage: existing?.percentage ?? (100 / members.length),
        shares: existing?.shares ?? 1,
        customAmount: existing?.amount,
      }
    })
  )

  // Recurring state
  const [recurringEnabled, setRecurringEnabled] = useState(!!initial?.recurring)
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>(
    initial?.recurring?.frequency ?? 'monthly'
  )
  const [recurringStartDate, setRecurringStartDate] = useState(
    initial?.recurring?.startDate ?? toISODate()
  )
  const [recurringEndDate, setRecurringEndDate] = useState(
    initial?.recurring?.endDate ?? ''
  )

  const parsedAmount = parseFloat(amount) || 0

  const handleMethodChange = (method: SplitMethod) => {
    setSplitMethod(method)
    // Reset splits when changing method
    if (method === 'equal') {
      setSplits(members.map((m) => ({ memberId: m.id })))
    } else if (method === 'percentage') {
      const pct = 100 / members.length
      setSplits(members.map((m) => ({ memberId: m.id, percentage: Math.round(pct * 10) / 10 })))
    } else if (method === 'shares') {
      setSplits(members.map((m) => ({ memberId: m.id, shares: 1 })))
    } else {
      setSplits(members.map((m) => ({ memberId: m.id, customAmount: 0 })))
    }
  }

  const canSubmit = () => {
    if (!description.trim() || parsedAmount <= 0 || !paidBy) return false
    if (members.length === 0) return false

    if (splitMethod === 'percentage') {
      const total = splits.reduce((s, sp) => s + (sp.percentage ?? 0), 0)
      if (Math.abs(total - 100) > 0.1) return false
    }
    if (splitMethod === 'custom') {
      const total = splits.reduce((s, sp) => s + (sp.customAmount ?? 0), 0)
      if (Math.abs(total - parsedAmount) > 0.01) return false
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit()) return

    const input: ExpenseCreateInput = {
      groupId,
      description: description.trim(),
      amount: parsedAmount,
      date,
      paidByMemberId: paidBy,
      splitMethod,
      splits: splits.map((s) => ({
        memberId: s.memberId,
        percentage: s.percentage,
        shares: s.shares,
      })),
    }

    if (recurringEnabled) {
      input.recurring = {
        frequency: recurringFrequency,
        startDate: recurringStartDate,
        endDate: recurringEndDate || undefined,
      }
    }

    onSubmit(input)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="תיאור"
        placeholder="לדוגמה, שכר דירה, חשבון חשמל"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        autoFocus
      />

      <Input
        label="סכום"
        type="number"
        min={0}
        step={0.01}
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Input
        label="תאריך"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <MemberSelect
        label="שולם ע״י"
        members={members}
        value={paidBy}
        onChange={setPaidBy}
      />

      <SplitMethodSelector value={splitMethod} onChange={handleMethodChange} />

      <SplitDetailsForm
        members={members}
        splitMethod={splitMethod}
        totalAmount={parsedAmount}
        splits={splits}
        onChange={setSplits}
        currency={currency}
      />

      <RecurringConfigComponent
        enabled={recurringEnabled}
        onToggle={setRecurringEnabled}
        frequency={recurringFrequency}
        onFrequencyChange={setRecurringFrequency}
        startDate={recurringStartDate}
        onStartDateChange={setRecurringStartDate}
        endDate={recurringEndDate}
        onEndDateChange={setRecurringEndDate}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={!canSubmit()}>
          {initial ? 'עדכון הוצאה' : 'הוספת הוצאה'}
        </Button>
      </div>
    </form>
  )
}
