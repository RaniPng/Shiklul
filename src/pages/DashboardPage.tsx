import { useState } from 'react'
import { useGroupStore, useUIStore } from '../store'
import Header from '../components/layout/Header'
import GroupList from '../components/group/GroupList'
import GroupForm from '../components/group/GroupForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

export default function DashboardPage() {
  const groups = useGroupStore((s) => s.groups)
  const createGroup = useGroupStore((s) => s.createGroup)
  const addToast = useUIStore((s) => s.addToast)
  const [showForm, setShowForm] = useState(false)

  const handleCreate = (input: Parameters<typeof createGroup>[0]) => {
    createGroup(input)
    setShowForm(false)
    addToast('הקבוצה נוצרה', 'success')
  }

  return (
    <div>
      <Header title="ראשי" />
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">הקבוצות שלך</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {groups.length === 0
                ? 'צור את הקבוצה הראשונה שלך כדי להתחיל'
                : `${groups.length} קבוצות`}
            </p>
          </div>
          {groups.length > 0 && (
            <Button onClick={() => setShowForm(true)}>
              <svg className="w-4 h-4 me-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              קבוצה חדשה
            </Button>
          )}
        </div>

        <GroupList groups={groups} onCreateGroup={() => setShowForm(true)} />

        <Modal open={showForm} onClose={() => setShowForm(false)} title="יצירת קבוצה חדשה">
          <GroupForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      </div>
    </div>
  )
}
