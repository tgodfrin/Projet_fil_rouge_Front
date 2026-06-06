import { EventType } from './event.model';

// Type d'incident sélectionnable dans le formulaire de signalement.
// Réutilise l'enum EventType (panne, retour anticipé, prolongation) pour éviter un type en double.
export interface IncidentOption {
  type: EventType;
  label: string;
  icon: string;
}
