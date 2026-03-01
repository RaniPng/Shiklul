import type { DebtEdge } from '../types'
import { toCents, fromCents } from './currency'

export function simplifyDebts(balances: Map<string, number>): DebtEdge[] {
  // Work in cents for precision
  const creditors: Array<{ id: string; amount: number }> = []
  const debtors: Array<{ id: string; amount: number }> = []

  for (const [id, balance] of balances) {
    const cents = toCents(balance)
    if (cents > 0) {
      creditors.push({ id, amount: cents })
    } else if (cents < 0) {
      debtors.push({ id, amount: -cents }) // store as positive
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const result: DebtEdge[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]!
    const debtor = debtors[di]!
    const transfer = Math.min(creditor.amount, debtor.amount)

    if (transfer > 0) {
      result.push({
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        amount: fromCents(transfer),
      })
    }

    creditor.amount -= transfer
    debtor.amount -= transfer

    if (creditor.amount === 0) ci++
    if (debtor.amount === 0) di++
  }

  return result
}
