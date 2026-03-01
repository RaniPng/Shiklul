export interface DebtEdge {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export interface MemberBalance {
  memberId: string;
  totalPaid: number;
  totalOwed: number;
  totalSettledPaid: number;
  totalSettledReceived: number;
  netBalance: number;
}

export interface GroupBalances {
  groupId: string;
  memberBalances: MemberBalance[];
  simplifiedDebts: DebtEdge[];
}
