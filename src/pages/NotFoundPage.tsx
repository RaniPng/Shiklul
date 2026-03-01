import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

export default function NotFoundPage() {
  return (
    <div>
      <Header title="לא נמצא" />
      <EmptyState
        title="העמוד לא נמצא"
        description="העמוד שחיפשת לא קיים."
        action={
          <Link to="/">
            <Button>חזרה לדף הראשי</Button>
          </Link>
        }
      />
    </div>
  )
}
