// Correspond à l'entité Event + l'enum EventType côté back
// Sérialisé via @JsonView(EventView)
// Endpoints :
//   POST /event
//   GET  /event/loan/:loanId
//   GET  /event/unread
//   PUT  /event/:id/read

export type EventType = 'BREAKDOWN' | 'EARLY_RETURN' | 'EXTENSION';

// Statut de décision du gestionnaire sur une demande (retour anticipé / prolongation)
// PENDING = en attente ; ACCEPTED = acceptée ; REFUSED = refusée
export type EventStatusType = 'PENDING' | 'ACCEPTED' | 'REFUSED';

// Seul l'id du Loan est exposé en EventView (évite la boucle Loan → Event → Loan)
export interface EventLoan {
  id: number;
}

export interface Event {
  id: number;
  createdAt: string;             // LocalDateTime → ISO string
  description: string | null;    // motif libre saisi par l'utilisateur
  requestedDate: string | null;  // date demandée (retour anticipé / prolongation) — champ dédié
  decisionStatus: EventStatusType; // statut de décision fiable (plus de déduction par dates)
  readingDate: string | null;    // null = non lu par le gestionnaire
  type: EventType;
  loan: EventLoan;
}
