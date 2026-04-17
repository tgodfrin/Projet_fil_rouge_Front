export type IncidentType = 'DYSFONCTIONNEMENT' | 'PANNE' | 'DEGRADATION' | 'AUTRE';

export interface IncidentOption {
  type: IncidentType;
  label: string;
  icon: string;
}
