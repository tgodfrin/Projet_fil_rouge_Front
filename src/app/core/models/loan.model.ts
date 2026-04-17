// ── Vue gestionnaire ──────────────────────────────────
export type LoanStatus = 'EN_ATTENTE' | 'EN_COURS' | 'RETARD' | 'TERMINE' | 'REFUSE';

export interface Loan {
  id: number;
  equipmentName: string;
  borrowerName: string;
  borrowerInitials: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  comment?: string;
}

// ── Vue utilisateur ───────────────────────────────────
export type UserLoanStatus = 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE' | 'RETARD' | 'TERMINE' | 'REFUSE';

export interface UserLoan {
  id: number;
  equipmentName: string;
  categoryIcon?: string;
  category?: string;
  startDate: string;
  endDate: string;
  status?: UserLoanStatus;
}

// ── Demande d'emprunt ─────────────────────────────────
export interface LoanRequestEquipment {
  id: number;
  name: string;
  ref: string;
  category: string;
  icon: string;
}
