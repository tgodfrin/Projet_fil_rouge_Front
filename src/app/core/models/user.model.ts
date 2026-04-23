export type UserRole = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  activeLoans: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  lastname: string;
  email: string;
  role: string;
  initials: string;
  memberSince: string;
}
