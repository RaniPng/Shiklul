import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import GroupDetailPage from './pages/GroupDetailPage'
import ExpenseHistoryPage from './pages/ExpenseHistoryPage'
import AddExpensePage from './pages/AddExpensePage'
import EditExpensePage from './pages/EditExpensePage'
import SettlementsPage from './pages/SettlementsPage'
import AddSettlementPage from './pages/AddSettlementPage'
import GroupSettingsPage from './pages/GroupSettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/groups/:groupId/expenses" element={<ExpenseHistoryPage />} />
        <Route path="/groups/:groupId/expenses/new" element={<AddExpensePage />} />
        <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<EditExpensePage />} />
        <Route path="/groups/:groupId/settlements" element={<SettlementsPage />} />
        <Route path="/groups/:groupId/settlements/new" element={<AddSettlementPage />} />
        <Route path="/groups/:groupId/settings" element={<GroupSettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
