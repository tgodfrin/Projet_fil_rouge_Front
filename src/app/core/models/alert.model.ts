// ⚠️ Interface UI-only — pas d'entité Alert côté back
// L'alert-list est construite en agrégeant deux sources :
//   • GET /event/unread  → Event de type BREAKDOWN | EARLY_RETURN | EXTENSION
//   • GET /loan/list     → filtrer les Loan IN_PROGRESS dont endDate est dépassée → RETARD
//
// Cette interface sera hydratée dans AlertListService lors du branchement du composant.

import { EventType } from './event.model';

// RETARD n'est pas dans l'enum EventType côté back — c'est un état calculé côté front
export type AlertType = EventType | 'RETARD';

export interface Alert {
  id: number;
  loanId: number;
  type: AlertType;
  equipmentName: string;
  borrowerName: string;
  description: string;
  date: string;           // createdAt de l'Event ou endDate du Loan
  read: boolean;          // readingDate !== null pour les Events / toujours false pour RETARD
}
