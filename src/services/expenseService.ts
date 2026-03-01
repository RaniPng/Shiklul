import type { Expense, ExpenseCreateInput, ExpenseUpdateInput, ExpenseFilter } from '../types'
import { getItem, setItem, STORAGE_KEYS } from './storage'
import { generateUUID } from '../utils/uuid'
import { toISODate, toISOString } from '../utils/date'
import { calculateSplits } from '../utils/splitCalculator'
import { groupService } from './groupService'

function getAllExpenses(): Expense[] {
  return getItem<Expense>(STORAGE_KEYS.EXPENSES)
}

function saveExpenses(expenses: Expense[]): void {
  setItem(STORAGE_KEYS.EXPENSES, expenses)
}

function getExpensesByGroup(groupId: string, filter?: ExpenseFilter): Expense[] {
  let expenses = getAllExpenses().filter((e) => e.groupId === groupId && !e.recurring)

  if (filter) {
    if (filter.startDate) {
      expenses = expenses.filter((e) => e.date >= filter.startDate!)
    }
    if (filter.endDate) {
      expenses = expenses.filter((e) => e.date <= filter.endDate!)
    }
    if (filter.paidByMemberId) {
      expenses = expenses.filter((e) => e.paidByMemberId === filter.paidByMemberId)
    }
    if (filter.minAmount !== undefined) {
      expenses = expenses.filter((e) => e.amount >= filter.minAmount!)
    }
    if (filter.maxAmount !== undefined) {
      expenses = expenses.filter((e) => e.amount <= filter.maxAmount!)
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase()
      expenses = expenses.filter((e) => e.description.toLowerCase().includes(q))
    }
  }

  return expenses.sort((a, b) => b.date.localeCompare(a.date))
}

function getExpenseById(expenseId: string): Expense | undefined {
  return getAllExpenses().find((e) => e.id === expenseId)
}

function createExpense(input: ExpenseCreateInput): Expense {
  const group = groupService.getGroupById(input.groupId)
  if (!group) throw new Error(`Group ${input.groupId} not found`)

  const splitInputs = input.splits.map((s) => ({
    memberId: s.memberId,
    percentage: s.percentage,
    shares: s.shares,
  }))

  const resolvedSplits = calculateSplits(input.amount, input.splitMethod, splitInputs)

  const now = toISOString()
  const expense: Expense = {
    id: generateUUID(),
    groupId: input.groupId,
    description: input.description,
    amount: input.amount,
    currency: group.currency,
    date: input.date ?? toISODate(),
    paidByMemberId: input.paidByMemberId,
    splitMethod: input.splitMethod,
    splits: resolvedSplits,
    recurring: input.recurring ? { ...input.recurring, lastGeneratedDate: undefined } : undefined,
    createdAt: now,
    updatedAt: now,
  }

  const expenses = getAllExpenses()
  expenses.push(expense)
  saveExpenses(expenses)
  return expense
}

function updateExpense(expenseId: string, input: ExpenseUpdateInput): Expense {
  const expenses = getAllExpenses()
  const idx = expenses.findIndex((e) => e.id === expenseId)
  if (idx === -1) throw new Error(`Expense ${expenseId} not found`)

  const expense = expenses[idx]!

  if (input.description !== undefined) expense.description = input.description
  if (input.date !== undefined) expense.date = input.date
  if (input.paidByMemberId !== undefined) expense.paidByMemberId = input.paidByMemberId

  // If amount or splits changed, recalculate
  if (input.amount !== undefined || input.splits !== undefined || input.splitMethod !== undefined) {
    const amount = input.amount ?? expense.amount
    const method = input.splitMethod ?? expense.splitMethod
    const splitInputs = (input.splits ?? expense.splits).map((s) => ({
      memberId: s.memberId,
      percentage: s.percentage,
      shares: s.shares,
    }))

    expense.amount = amount
    expense.splitMethod = method
    expense.splits = calculateSplits(amount, method, splitInputs)
  }

  expense.updatedAt = toISOString()
  saveExpenses(expenses)
  return expense
}

function deleteExpense(expenseId: string): void {
  const expenses = getAllExpenses().filter((e) => e.id !== expenseId)
  saveExpenses(expenses)
}

function getRecurringTemplates(groupId: string): Expense[] {
  return getAllExpenses().filter((e) => e.groupId === groupId && e.recurring)
}

export const expenseService = {
  getAllExpenses,
  getExpensesByGroup,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getRecurringTemplates,
}
