// BREAKDOWN | EARLY_RETURN | EXTENSION → viennent de l'entité Event (déclarés par l'utilisateur)
// RETARD → généré automatiquement côté service (endDate dépassée + statut IN_PROGRESS)
export type AlertType = 'BREAKDOWN' | 'EARLY_RETURN' | 'EXTENSION' | 'RETARD';

export interface Alert {
  id: number;
  loanId: number;
  type: AlertType;
  equipmentName: string;
  borrowerName: string;
  description: string;
  date: string;
  read: boolean;
}
