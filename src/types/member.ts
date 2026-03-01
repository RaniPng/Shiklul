export interface Member {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  createdAt: string;
}

export interface MemberCreateInput {
  name: string;
  email?: string;
  avatarColor?: string;
}
