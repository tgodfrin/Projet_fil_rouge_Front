// Interface utilisée uniquement côté UI : il n'y a pas d'entité Alert côté back.
// La liste d'alertes agrège deux sources :
//   - les événements (incident, retour anticipé, prolongation), via GET /event/list
//   - les emprunts validés dont la date de fin est dépassée, considérés en retard, via GET /loan/list

import { EventType } from './event.model';

// RETARD ne fait pas partie de l'enum EventType du back : c'est un état calculé côté front.
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
