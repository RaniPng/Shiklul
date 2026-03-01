import { useState } from 'react'
import type { Member, SettlementCreateInput } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import MemberSelect from '../member/MemberSelect'
import { toISODate } from '../../utils/date'

interface SettlementFormProps {
  groupId: string;
  members: Member[];
  onSubmit: (input: SettlementCreateInput) => void;
  onCancel: () => void;
  defaultFrom?: string;
  defaultTo?: string;
  defaultAmount?: number;
}

export default function SettlementForm({
  groupId,
  members,
  onSubmit,
  onCancel,
  defaultFrom = '',
  defaultTo = '',
  defaultAmount,
}: SettlementFormProps) {
  const [fromMemberId, setFromMemberId] = useState(defaultFrom)
  const [toMemberId, setToMemberId] = useState(defaultTo)
  const [amount, setAmount] = useState(defaultAmount?.toString() ?? '')
  const [date, setDate] = useState(toISODate())
  const [note, setNote] = useState('')

  const parsedAmount = parseFloat(amount) || 0

  const canSubmit =
    fromMemberId &&
    toMemberId &&
    fromMemberId !== toMemberId &&
    parsedAmount > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      groupId,
      fromMemberId,
      toMemberId,
      amount: parsedAmount,
      date,
      note: note.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MemberSelect
        label="מי משלם?"
        members={members}
        value={fromMemberId}
        onChange={setFromMemberId}
      />
      <MemberSelect
        label="מי מקבל?"
        members={members.filter((m) => m.id !== fromMemberId)}
        value={toMemberId}
        onChange={setToMemberId}
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
      <Input
        label="הערה (אופציונלי)"
        placeholder="לדוגמה, העברה בנקאית"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          תיעוד תשלום
        </Button>
      </div>
    </form>
  )
}
