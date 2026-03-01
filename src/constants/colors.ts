export const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
] as const

let colorIndex = 0

export function getNextAvatarColor(): string {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]!
  colorIndex++
  return color
}

export function resetColorIndex() {
  colorIndex = 0
}
