export type IncidentType = 'PANNE' | 'RETOUR_ANTICIPE' | 'PROLONGATION';

export interface IncidentOption {
  type: IncidentType;
  label: string;
  icon: string;
}
