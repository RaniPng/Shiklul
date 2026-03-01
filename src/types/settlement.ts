export interface Settlement {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface SettlementCreateInput {
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date?: string;
  note?: string;
}
