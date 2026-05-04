// Correspond à l'entité Event + l'enum EventType côté back
// Sérialisé via @JsonView(EventView)
// Endpoints :
//   POST /event
//   GET  /event/loan/:loanId
//   GET  /event/unread
//   PUT  /event/:id/read

export type EventType = 'BREAKDOWN' | 'EARLY_RETURN' | 'EXTENSION';

// Seul l'id du Loan est exposé en EventView (évite la boucle Loan → Event → Loan)
export interface EventLoan {
  id: number;
}

export interface Event {
  id: number;
  createdAt: string;         // LocalDateTime → ISO string
  description: string | null;
  readingDate: string | null; // null = non lu par le gestionnaire
  type: EventType;
  loan: EventLoan;
}
