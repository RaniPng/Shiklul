import type { Member } from '../../types'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

interface MemberListProps {
  members: Member[];
  onRemove?: (memberId: string) => void;
}

export default function MemberList({ members, onRemove }: MemberListProps) {
  if (members.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 py-2">אין חברים עדיין</p>
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Avatar name={member.name} color={member.avatarColor} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
            {member.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
            )}
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(member.id)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              הסרה
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
