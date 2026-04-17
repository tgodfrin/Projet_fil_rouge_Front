export type AlertType = 'RETARD' | 'INCIDENT';

export interface Alert {
  id: number;
  type: AlertType;
  equipmentName: string;
  borrowerName: string;
  description: string;
  date: string;
  read: boolean;
}
