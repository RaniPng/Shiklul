import { create } from 'zustand'
import type { Settlement, SettlementCreateInput } from '../types'
import { settlementService } from '../services/settlementService'

interface SettlementState {
  settlementsByGroup: Record<string, Settlement[]>;
  loadSettlements: (groupId: string) => void;
  createSettlement: (input: SettlementCreateInput) => Settlement;
  deleteSettlement: (settlementId: string, groupId: string) => void;
  getSettlementsForGroup: (groupId: string) => Settlement[];
}

export const useSettlementStore = create<SettlementState>((set, get) => ({
  settlementsByGroup: {},

  loadSettlements: (groupId) => {
    const settlements = settlementService.getSettlementsByGroup(groupId)
    set((state) => ({
      settlementsByGroup: { ...state.settlementsByGroup, [groupId]: settlements },
    }))
  },

  createSettlement: (input) => {
    const settlement = settlementService.createSettlement(input)
    const settlements = settlementService.getSettlementsByGroup(input.groupId)
    set((state) => ({
      settlementsByGroup: { ...state.settlementsByGroup, [input.groupId]: settlements },
    }))
    return settlement
  },

  deleteSettlement: (settlementId, groupId) => {
    settlementService.deleteSettlement(settlementId)
    const settlements = settlementService.getSettlementsByGroup(groupId)
    set((state) => ({
      settlementsByGroup: { ...state.settlementsByGroup, [groupId]: settlements },
    }))
  },

  getSettlementsForGroup: (groupId) => {
    return get().settlementsByGroup[groupId] ?? []
  },
}))
