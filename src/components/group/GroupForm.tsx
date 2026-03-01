import { useState } from 'react'
import type { GroupCreateInput } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { CURRENCY_SYMBOLS } from '../../constants/defaults'

interface GroupFormProps {
  onSubmit: (input: GroupCreateInput) => void;
  onCancel: () => void;
  initial?: { name: string; description?: string; currency?: string };
}

const currencyOptions = Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => ({
  value: code,
  label: `${code} (${symbol})`,
}))

export default function GroupForm({ onSubmit, onCancel, initial }: GroupFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() || undefined, currency })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שם הקבוצה"
        placeholder="לדוגמה, דירה 4ב"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
      <Input
        label="תיאור"
        placeholder="תיאור (אופציונלי)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Select
        label="מטבע"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        options={currencyOptions}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {initial ? 'שמירה' : 'יצירת קבוצה'}
        </Button>
      </div>
    </form>
  )
}
