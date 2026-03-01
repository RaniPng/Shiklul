export function toISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]!
}

export function toISOString(date: Date = new Date()): string {
  return date.toISOString()
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  d.setMonth(d.getMonth() + months)
  return toISODate(d)
}

export function addWeeks(isoDate: string, weeks: number): string {
  return addDays(isoDate, weeks * 7)
}

export function isBeforeOrEqual(a: string, b: string): boolean {
  return a <= b
}
