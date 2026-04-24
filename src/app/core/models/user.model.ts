export type UserRole = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  activeLoans: number; // calculé côté service (count des emprunts IN_PROGRESS + VALID)
  createdAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
  createdAt: string;
  // initials → calculé côté front : name[0] + lastname[0]
  // memberSince supprimé : doublon de createdAt
}
