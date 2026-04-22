export type UserRole = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  activeLoans: number;
  createdAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  initials: string;
  memberSince: string;
}
