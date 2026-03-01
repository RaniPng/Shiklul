import type { Settlement, SettlementCreateInput } from '../types'
import { getItem, setItem, STORAGE_KEYS } from './storage'
import { generateUUID } from '../utils/uuid'
import { toISODate, toISOString } from '../utils/date'

function getAllSettlements(): Settlement[] {
  return getItem<Settlement>(STORAGE_KEYS.SETTLEMENTS)
}

function saveSettlements(settlements: Settlement[]): void {
  setItem(STORAGE_KEYS.SETTLEMENTS, settlements)
}

function getSettlementsByGroup(groupId: string): Settlement[] {
  return getAllSettlements()
    .filter((s) => s.groupId === groupId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

function createSettlement(input: SettlementCreateInput): Settlement {
  const settlement: Settlement = {
    id: generateUUID(),
    groupId: input.groupId,
    fromMemberId: input.fromMemberId,
    toMemberId: input.toMemberId,
    amount: input.amount,
    date: input.date ?? toISODate(),
    note: input.note,
    createdAt: toISOString(),
  }

  const settlements = getAllSettlements()
  settlements.push(settlement)
  saveSettlements(settlements)
  return settlement
}

function deleteSettlement(settlementId: string): void {
  const settlements = getAllSettlements().filter((s) => s.id !== settlementId)
  saveSettlements(settlements)
}

export const settlementService = {
  getAllSettlements,
  getSettlementsByGroup,
  createSettlement,
  deleteSettlement,
}
