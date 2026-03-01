import type { RecurringFrequency } from '../../types'
import Input from '../ui/Input'
import Select from '../ui/Select'

interface RecurringConfigProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  frequency: RecurringFrequency;
  onFrequencyChange: (freq: RecurringFrequency) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

const frequencyOptions = [
  { value: 'monthly', label: 'חודשי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'biweekly', label: 'כל שבועיים' },
]

export default function RecurringConfig({
  enabled,
  onToggle,
  frequency,
  onFrequencyChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: RecurringConfigProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">הוצאה חוזרת</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">חזרה אוטומטית על הוצאה זו</p>
        </div>
      </label>

      {enabled && (
        <div className="mt-4 space-y-3 ps-7">
          <Select
            label="תדירות"
            value={frequency}
            onChange={(e) => onFrequencyChange(e.target.value as RecurringFrequency)}
            options={frequencyOptions}
          />
          <Input
            label="תאריך התחלה"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <Input
            label="תאריך סיום (אופציונלי)"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
