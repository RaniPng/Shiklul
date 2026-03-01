import { create } from 'zustand'
import type { Expense, ExpenseCreateInput, ExpenseUpdateInput, ExpenseFilter } from '../types'
import { expenseService } from '../services/expenseService'

interface ExpenseState {
  expensesByGroup: Record<string, Expense[]>;
  loadExpenses: (groupId: string) => void;
  createExpense: (input: ExpenseCreateInput) => Expense;
  updateExpense: (expenseId: string, input: ExpenseUpdateInput) => Expense;
  deleteExpense: (expenseId: string, groupId: string) => void;
  getExpensesForGroup: (groupId: string, filter?: ExpenseFilter) => Expense[];
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expensesByGroup: {},

  loadExpenses: (groupId) => {
    const expenses = expenseService.getExpensesByGroup(groupId)
    set((state) => ({
      expensesByGroup: { ...state.expensesByGroup, [groupId]: expenses },
    }))
  },

  createExpense: (input) => {
    const expense = expenseService.createExpense(input)
    const expenses = expenseService.getExpensesByGroup(input.groupId)
    set((state) => ({
      expensesByGroup: { ...state.expensesByGroup, [input.groupId]: expenses },
    }))
    return expense
  },

  updateExpense: (expenseId, input) => {
    const expense = expenseService.updateExpense(expenseId, input)
    const expenses = expenseService.getExpensesByGroup(expense.groupId)
    set((state) => ({
      expensesByGroup: { ...state.expensesByGroup, [expense.groupId]: expenses },
    }))
    return expense
  },

  deleteExpense: (expenseId, groupId) => {
    expenseService.deleteExpense(expenseId)
    const expenses = expenseService.getExpensesByGroup(groupId)
    set((state) => ({
      expensesByGroup: { ...state.expensesByGroup, [groupId]: expenses },
    }))
  },

  getExpensesForGroup: (groupId, filter) => {
    if (filter) {
      return expenseService.getExpensesByGroup(groupId, filter)
    }
    return get().expensesByGroup[groupId] ?? []
  },
}))
