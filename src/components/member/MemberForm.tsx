import { useState } from 'react'
import type { MemberCreateInput } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface MemberFormProps {
  onSubmit: (input: MemberCreateInput) => void;
  onCancel: () => void;
  initial?: { name: string; email?: string };
}

export default function MemberForm({ onSubmit, onCancel, initial }: MemberFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), email: email.trim() || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שם"
        placeholder="לדוגמה, יוסי"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
      <Input
        label="אימייל"
        type="email"
        placeholder="אופציונלי"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {initial ? 'שמירה' : 'הוספת חבר'}
        </Button>
      </div>
    </form>
  )
}
