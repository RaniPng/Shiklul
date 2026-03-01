import { create } from 'zustand'
import type { Group, GroupCreateInput, GroupUpdateInput, Member, MemberCreateInput } from '../types'
import { groupService } from '../services/groupService'

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  loadGroups: () => void;
  createGroup: (input: GroupCreateInput) => Group;
  updateGroup: (groupId: string, input: GroupUpdateInput) => Group;
  deleteGroup: (groupId: string) => void;
  addMember: (groupId: string, input: MemberCreateInput) => Member;
  updateMember: (groupId: string, memberId: string, input: Partial<MemberCreateInput>) => Member;
  removeMember: (groupId: string, memberId: string) => void;
  getGroupById: (groupId: string) => Group | undefined;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoading: true,

  loadGroups: () => {
    const groups = groupService.getAllGroups()
    set({ groups, isLoading: false })
  },

  createGroup: (input) => {
    const group = groupService.createGroup(input)
    set({ groups: groupService.getAllGroups() })
    return group
  },

  updateGroup: (groupId, input) => {
    const group = groupService.updateGroup(groupId, input)
    set({ groups: groupService.getAllGroups() })
    return group
  },

  deleteGroup: (groupId) => {
    groupService.deleteGroup(groupId)
    set({ groups: groupService.getAllGroups() })
  },

  addMember: (groupId, input) => {
    const member = groupService.addMember(groupId, input)
    set({ groups: groupService.getAllGroups() })
    return member
  },

  updateMember: (groupId, memberId, input) => {
    const member = groupService.updateMember(groupId, memberId, input)
    set({ groups: groupService.getAllGroups() })
    return member
  },

  removeMember: (groupId, memberId) => {
    groupService.removeMember(groupId, memberId)
    set({ groups: groupService.getAllGroups() })
  },

  getGroupById: (groupId) => {
    return get().groups.find((g) => g.id === groupId)
  },
}))
