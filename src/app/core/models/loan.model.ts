// ── Vue gestionnaire ──────────────────────────────────
export type LoanStatus = 'IN_PROGRESS' | 'VALID' | 'RETARD' | 'TERMINE' | 'INVALID';

export interface Loan {
  id: number;
  equipmentName: string;
  borrowerName: string;
  borrowerInitials: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
}

// ── Vue utilisateur ───────────────────────────────────
export type UserLoanStatus = 'VALID' | 'IN_PROGRESS' | 'HISTORIQUE' | 'RETARD' | 'TERMINE' | 'INVALID';

export interface UserLoan {
  id: number;
  equipmentName: string;
  categoryIcon?: string;
  category?: string;
  startDate: string;
  endDate: string;
  status: UserLoanStatus;
}

// ── Demande d'emprunt ─────────────────────────────────
export interface LoanRequestEquipment {
  id: number;
  name: string;
  ref: string;
  category: string;
  icon: string;
}
