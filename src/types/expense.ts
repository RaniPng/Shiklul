export type SplitMethod = 'equal' | 'percentage' | 'shares' | 'custom';

export type RecurringFrequency = 'monthly' | 'weekly' | 'biweekly';

export interface ExpenseSplit {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface RecurringConfig {
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastGeneratedDate?: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidByMemberId: string;
  splitMethod: SplitMethod;
  splits: ExpenseSplit[];
  recurring?: RecurringConfig;
  parentRecurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCreateInput {
  groupId: string;
  description: string;
  amount: number;
  date?: string;
  paidByMemberId: string;
  splitMethod: SplitMethod;
  splits: Omit<ExpenseSplit, 'amount'>[];
  recurring?: Omit<RecurringConfig, 'lastGeneratedDate'>;
}

export interface ExpenseUpdateInput {
  description?: string;
  amount?: number;
  date?: string;
  paidByMemberId?: string;
  splitMethod?: SplitMethod;
  splits?: Omit<ExpenseSplit, 'amount'>[];
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  paidByMemberId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}
