import type { Group, GroupCreateInput, GroupUpdateInput, Member, MemberCreateInput, Expense, Settlement } from '../types'
import { getItem, setItem, STORAGE_KEYS } from './storage'
import { generateUUID } from '../utils/uuid'
import { toISOString } from '../utils/date'
import { getNextAvatarColor } from '../constants/colors'
import { DEFAULT_CURRENCY } from '../constants/defaults'

function getAllGroups(): Group[] {
  return getItem<Group>(STORAGE_KEYS.GROUPS)
}

function getGroupById(groupId: string): Group | undefined {
  return getAllGroups().find((g) => g.id === groupId)
}

function saveGroups(groups: Group[]): void {
  setItem(STORAGE_KEYS.GROUPS, groups)
}

function createGroup(input: GroupCreateInput): Group {
  const now = toISOString()
  const group: Group = {
    id: generateUUID(),
    name: input.name,
    description: input.description,
    currency: input.currency ?? DEFAULT_CURRENCY,
    members: [],
    createdAt: now,
    updatedAt: now,
  }
  const groups = getAllGroups()
  groups.push(group)
  saveGroups(groups)
  return group
}

function updateGroup(groupId: string, input: GroupUpdateInput): Group {
  const groups = getAllGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error(`Group ${groupId} not found`)

  const group = groups[idx]!
  if (input.name !== undefined) group.name = input.name
  if (input.description !== undefined) group.description = input.description
  if (input.currency !== undefined) group.currency = input.currency
  group.updatedAt = toISOString()

  saveGroups(groups)
  return group
}

function deleteGroup(groupId: string): void {
  const groups = getAllGroups().filter((g) => g.id !== groupId)
  saveGroups(groups)

  // Cascade delete expenses and settlements
  const expenses = getItem<Expense>(STORAGE_KEYS.EXPENSES).filter((e) => e.groupId !== groupId)
  setItem(STORAGE_KEYS.EXPENSES, expenses)
  const settlements = getItem<Settlement>(STORAGE_KEYS.SETTLEMENTS).filter((s) => s.groupId !== groupId)
  setItem(STORAGE_KEYS.SETTLEMENTS, settlements)
}

function addMember(groupId: string, input: MemberCreateInput): Member {
  const groups = getAllGroups()
  const group = groups.find((g) => g.id === groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  const member: Member = {
    id: generateUUID(),
    name: input.name,
    email: input.email,
    avatarColor: input.avatarColor ?? getNextAvatarColor(),
    createdAt: toISOString(),
  }
  group.members.push(member)
  group.updatedAt = toISOString()
  saveGroups(groups)
  return member
}

function updateMember(groupId: string, memberId: string, input: Partial<MemberCreateInput>): Member {
  const groups = getAllGroups()
  const group = groups.find((g) => g.id === groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  const member = group.members.find((m) => m.id === memberId)
  if (!member) throw new Error(`Member ${memberId} not found`)

  if (input.name !== undefined) member.name = input.name
  if (input.email !== undefined) member.email = input.email
  if (input.avatarColor !== undefined) member.avatarColor = input.avatarColor
  group.updatedAt = toISOString()

  saveGroups(groups)
  return member
}

function removeMember(groupId: string, memberId: string): void {
  const groups = getAllGroups()
  const group = groups.find((g) => g.id === groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  group.members = group.members.filter((m) => m.id !== memberId)
  group.updatedAt = toISOString()
  saveGroups(groups)
}

export const groupService = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  updateMember,
  removeMember,
}
