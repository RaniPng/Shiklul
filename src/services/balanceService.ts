import type { GroupBalances, MemberBalance } from '../types'
import { expenseService } from './expenseService'
import { settlementService } from './settlementService'
import { groupService } from './groupService'
import { simplifyDebts } from '../utils/debtSimplifier'

function calculateGroupBalances(groupId: string): GroupBalances {
  const group = groupService.getGroupById(groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  const expenses = expenseService.getExpensesByGroup(groupId)
  const settlements = settlementService.getSettlementsByGroup(groupId)

  const balanceMap = new Map<string, {
    totalPaid: number;
    totalOwed: number;
    totalSettledPaid: number;
    totalSettledReceived: number;
  }>()

  for (const member of group.members) {
    balanceMap.set(member.id, {
      totalPaid: 0,
      totalOwed: 0,
      totalSettledPaid: 0,
      totalSettledReceived: 0,
    })
  }

  for (const expense of expenses) {
    const payer = balanceMap.get(expense.paidByMemberId)
    if (payer) {
      payer.totalPaid += expense.amount
    }
    for (const split of expense.splits) {
      const member = balanceMap.get(split.memberId)
      if (member) {
        member.totalOwed += split.amount
      }
    }
  }

  for (const settlement of settlements) {
    const from = balanceMap.get(settlement.fromMemberId)
    if (from) {
      from.totalSettledPaid += settlement.amount
    }
    const to = balanceMap.get(settlement.toMemberId)
    if (to) {
      to.totalSettledReceived += settlement.amount
    }
  }

  // Net balance: positive = owed money, negative = owes money
  // (totalPaid - totalOwed) = net credit from expenses
  // +totalSettledPaid = settling debts reduces what you owe
  // -totalSettledReceived = receiving settlements reduces what you're owed
  const memberBalances: MemberBalance[] = []
  const netBalanceMap = new Map<string, number>()

  for (const [memberId, data] of balanceMap) {
    const netBalance =
      (data.totalPaid - data.totalOwed) +
      data.totalSettledPaid -
      data.totalSettledReceived

    memberBalances.push({
      memberId,
      totalPaid: data.totalPaid,
      totalOwed: data.totalOwed,
      totalSettledPaid: data.totalSettledPaid,
      totalSettledReceived: data.totalSettledReceived,
      netBalance,
    })
    netBalanceMap.set(memberId, netBalance)
  }

  return {
    groupId,
    memberBalances,
    simplifiedDebts: simplifyDebts(netBalanceMap),
  }
}

export const balanceService = {
  calculateGroupBalances,
}
