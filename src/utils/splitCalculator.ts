import type { SplitMethod, ExpenseSplit } from '../types'
import { toCents, fromCents } from './currency'

interface SplitInput {
  memberId: string;
  percentage?: number;
  shares?: number;
  customAmount?: number;
}

export function calculateSplits(
  totalAmount: number,
  splitMethod: SplitMethod,
  inputs: SplitInput[],
): ExpenseSplit[] {
  switch (splitMethod) {
    case 'equal':
      return calculateEqualSplit(totalAmount, inputs)
    case 'percentage':
      return calculatePercentageSplit(totalAmount, inputs)
    case 'shares':
      return calculateSharesSplit(totalAmount, inputs)
    case 'custom':
      return calculateCustomSplit(inputs)
  }
}

function calculateEqualSplit(totalAmount: number, inputs: SplitInput[]): ExpenseSplit[] {
  const count = inputs.length
  const totalCents = toCents(totalAmount)
  const baseCents = Math.floor(totalCents / count)
  let remainderCents = totalCents - baseCents * count

  return inputs.map((input) => {
    const extra = remainderCents > 0 ? 1 : 0
    remainderCents--
    return {
      memberId: input.memberId,
      amount: fromCents(baseCents + extra),
    }
  })
}

function calculatePercentageSplit(totalAmount: number, inputs: SplitInput[]): ExpenseSplit[] {
  const totalCents = toCents(totalAmount)
  const splits = inputs.map((input) => {
    const pct = input.percentage ?? 0
    return {
      memberId: input.memberId,
      amount: fromCents(Math.round(totalCents * pct / 100)),
      percentage: pct,
    }
  })

  // Fix rounding: adjust largest split to make sum exact
  const sumCents = splits.reduce((s, sp) => s + toCents(sp.amount), 0)
  const diff = totalCents - sumCents
  if (diff !== 0) {
    const largest = splits.reduce((a, b) => a.amount >= b.amount ? a : b)
    largest.amount = fromCents(toCents(largest.amount) + diff)
  }

  return splits
}

function calculateSharesSplit(totalAmount: number, inputs: SplitInput[]): ExpenseSplit[] {
  const totalShares = inputs.reduce((s, i) => s + (i.shares ?? 1), 0)
  const totalCents = toCents(totalAmount)

  const splits = inputs.map((input) => {
    const sh = input.shares ?? 1
    return {
      memberId: input.memberId,
      amount: fromCents(Math.round(totalCents * sh / totalShares)),
      shares: sh,
    }
  })

  // Fix rounding
  const sumCents = splits.reduce((s, sp) => s + toCents(sp.amount), 0)
  const diff = totalCents - sumCents
  if (diff !== 0) {
    const largest = splits.reduce((a, b) => a.amount >= b.amount ? a : b)
    largest.amount = fromCents(toCents(largest.amount) + diff)
  }

  return splits
}

function calculateCustomSplit(inputs: SplitInput[]): ExpenseSplit[] {
  return inputs.map((input) => ({
    memberId: input.memberId,
    amount: input.customAmount ?? 0,
  }))
}
