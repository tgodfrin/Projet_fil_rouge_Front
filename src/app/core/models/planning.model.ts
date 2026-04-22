export interface PlanningEvent {
  id: number;
  borrowerName: string;
  equipmentName: string;
  category: string;
  startDate: string;
  endDate: string;
}

export interface PlanningRow {
  equipmentName: string;
  category: string;
  events: PlanningEvent[];
}
