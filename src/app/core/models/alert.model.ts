export type AlertType = 'RETARD' | 'PANNE';

export interface Alert {
  id: number;
  type: AlertType;
  equipmentName: string;
  borrowerName: string;
  description: string;
  date: string;
  read: boolean;
}
