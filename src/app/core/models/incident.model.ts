import { EventType } from './event.model';

// A selectable incident/event kind in the user "signalement" form.
// Reuses the canonical EventType (BREAKDOWN | EARLY_RETURN | EXTENSION) — no duplicate type.
export interface IncidentOption {
  type: EventType;
  label: string;
  icon: string;
}
