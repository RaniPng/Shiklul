import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/Toast'
import { useGroupStore } from '../../store'

export default function AppShell() {
  const loadGroups = useGroupStore((s) => s.loadGroups)

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}
