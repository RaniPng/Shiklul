import type { Member } from './member'

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupCreateInput {
  name: string;
  description?: string;
  currency?: string;
}

export interface GroupUpdateInput {
  name?: string;
  description?: string;
  currency?: string;
}
