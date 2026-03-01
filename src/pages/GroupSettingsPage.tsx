import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroupStore, useUIStore } from '../store'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import MemberList from '../components/member/MemberList'
import MemberForm from '../components/member/MemberForm'
import { CURRENCY_SYMBOLS } from '../constants/defaults'

const currencyOptions = Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => ({
  value: code,
  label: `${code} (${symbol})`,
}))

export default function GroupSettingsPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = useGroupStore((s) => s.getGroupById(groupId!))
  const updateGroup = useGroupStore((s) => s.updateGroup)
  const deleteGroup = useGroupStore((s) => s.deleteGroup)
  const addMember = useGroupStore((s) => s.addMember)
  const removeMember = useGroupStore((s) => s.removeMember)
  const addToast = useUIStore((s) => s.addToast)

  const [name, setName] = useState(group?.name ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [currency, setCurrency] = useState(group?.currency ?? 'USD')
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!group) {
    return (
      <div>
        <Header title="הקבוצה לא נמצאה" />
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400">קבוצה זו לא קיימת.</p>
        </div>
      </div>
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateGroup(groupId!, { name: name.trim(), description: description.trim() || undefined, currency })
    addToast('הקבוצה עודכנה', 'success')
  }

  const handleDelete = () => {
    deleteGroup(groupId!)
    addToast('הקבוצה נמחקה', 'success')
    navigate('/')
  }

  const handleAddMember = (input: Parameters<typeof addMember>[1]) => {
    addMember(groupId!, input)
    setShowMemberForm(false)
    addToast('חבר נוסף', 'success')
  }

  const handleRemoveMember = (memberId: string) => {
    removeMember(groupId!, memberId)
    addToast('חבר הוסר', 'success')
  }

  return (
    <div>
      <Header title="הגדרות קבוצה" />
      <div className="p-4 lg:p-6 max-w-2xl">
        <Card className="p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">פרטי הקבוצה</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="שם הקבוצה"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="תיאור"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="אופציונלי"
            />
            <Select
              label="מטבע"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!name.trim()}>שמירת שינויים</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">חברים</h3>
            <Button size="sm" onClick={() => setShowMemberForm(true)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              הוספה
            </Button>
          </div>
          <MemberList members={group.members} onRemove={handleRemoveMember} />
        </Card>

        <Card className="p-6 border-red-200 dark:border-red-800">
          <h3 className="text-base font-semibold text-red-600 mb-2">אזור מסוכן</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            מחיקת קבוצה זו תמחק לצמיתות את כל ההוצאות והתשלומים.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            מחיקת קבוצה
          </Button>
        </Card>

        <Modal open={showMemberForm} onClose={() => setShowMemberForm(false)} title="הוספת חבר">
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowMemberForm(false)}
          />
        </Modal>

        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="מחיקת קבוצה"
          message={`האם אתה בטוח שברצונך למחוק את "${group.name}"? פעולה זו תמחק לצמיתות את כל ההוצאות והתשלומים.`}
          confirmLabel="מחיקה"
        />
      </div>
    </div>
  )
}
