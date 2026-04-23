export type IncidentType = 'BREAKDOWN' | 'EARLY_RETURN' | 'EXTENSION';

export interface IncidentOption {
  type: IncidentType;
  label: string;
  icon: string;
}
