import type { SplitMethod } from '../../types'

interface SplitMethodSelectorProps {
  value: SplitMethod;
  onChange: (method: SplitMethod) => void;
}

const methods: Array<{ value: SplitMethod; label: string; desc: string }> = [
  { value: 'equal', label: 'שווה', desc: 'חלוקה שווה' },
  { value: 'percentage', label: 'אחוזים', desc: 'לפי אחוז מהסכום' },
  { value: 'shares', label: 'חלקים', desc: 'לפי חלקים משוקללים' },
  { value: 'custom', label: 'מותאם', desc: 'סכומים מדויקים' },
]

export default function SplitMethodSelector({ value, onChange }: SplitMethodSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">שיטת חלוקה</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {methods.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={`p-3 rounded-lg border text-right transition-colors ${
              value === m.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">{m.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
