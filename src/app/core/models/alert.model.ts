// Interface UI-only — pas d'entité Alert côté back
// L'alert-list est construite en agrégeant deux sources :
//   • GET /event/list  → Event de type BREAKDOWN | EARLY_RETURN | EXTENSION
//   • GET /loan/list   → filtrer les Loan VALID dont endDate est dépassée → RETARD

import { EventType } from './event.model';

// RETARD n'est pas dans l'enum EventType côté back — c'est un état calculé côté front
export type AlertType = EventType | 'RETARD';

export interface Alert {
  id: number;
  loanId: number;
  type: AlertType;
  equipmentName: string;
  borrowerName: string;
  description: string;            // motif libre de l'Event (ou texte de l'alerte RETARD)
  requestedDate: string | null;   // date demandée (retour anticipé / prolongation), champ dédié
  date: string;                   // createdAt de l'Event ou endDate du Loan
  read: boolean;                  // readingDate !== null pour les Events / toujours false pour RETARD
}
