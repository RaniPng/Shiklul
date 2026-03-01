import type { Expense, RecurringFrequency } from '../types'
import { expenseService } from './expenseService'
import { toISODate, addMonths, addWeeks, isBeforeOrEqual } from '../utils/date'

function getNextDate(date: string, frequency: RecurringFrequency): string {
  switch (frequency) {
    case 'monthly':
      return addMonths(date, 1)
    case 'weekly':
      return addWeeks(date, 1)
    case 'biweekly':
      return addWeeks(date, 2)
  }
}

function generateDueRecurringExpenses(groupId: string): Expense[] {
  const templates = expenseService.getRecurringTemplates(groupId)
  const today = toISODate()
  const generated: Expense[] = []

  for (const template of templates) {
    if (!template.recurring) continue

    const { frequency, startDate, endDate, lastGeneratedDate } = template.recurring
    let nextDate = lastGeneratedDate
      ? getNextDate(lastGeneratedDate, frequency)
      : startDate

    while (isBeforeOrEqual(nextDate, today)) {
      if (endDate && !isBeforeOrEqual(nextDate, endDate)) break

      const expense = expenseService.createExpense({
        groupId: template.groupId,
        description: template.description,
        amount: template.amount,
        date: nextDate,
        paidByMemberId: template.paidByMemberId,
        splitMethod: template.splitMethod,
        splits: template.splits.map((s) => ({
          memberId: s.memberId,
          percentage: s.percentage,
          shares: s.shares,
        })),
      })

      generated.push(expense)
      template.recurring.lastGeneratedDate = nextDate
      nextDate = getNextDate(nextDate, frequency)
    }
  }

  // Save updated templates with lastGeneratedDate
  if (generated.length > 0) {
    // Templates are already saved by expenseService, but we need to update lastGeneratedDate
    // Re-save all expenses to persist the lastGeneratedDate changes
    const allExpenses = expenseService.getAllExpenses()
    for (const template of templates) {
      const idx = allExpenses.findIndex((e) => e.id === template.id)
      if (idx !== -1) {
        allExpenses[idx] = template
      }
    }
    // Direct storage update for the template changes
    localStorage.setItem('partnerz_expenses', JSON.stringify(allExpenses))
  }

  return generated
}

export const recurringService = {
  generateDueRecurringExpenses,
}
