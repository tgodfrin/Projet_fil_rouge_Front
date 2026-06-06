// Correspond à l'entité Equipment côté back
// Sérialisé via @JsonView(EquipmentView)
// Endpoints :
//   GET    /equipment/list
//   GET    /equipment/:id
//   GET    /equipment/available?begin=...&end=...
//   POST   /equipment
//   PUT    /equipment/:id
//   DELETE /equipment/:id

import { EquipmentFamily } from './equipment-family.model';

// Champ @Transient calculé par EquipmentService.setCalculatedStatus() côté back :
//   DISPONIBLE : aucun emprunt validé en cours et aucun statut technique ouvert
//   EN_PRET : un emprunt validé occupe le matériel sur la date ou la période consultée
//   OUT_OF_SERVICE : statut technique "hors service" non résolu
//   UNDER_REPAIR : statut technique "en réparation" non résolu
export type EquipmentStatus = 'DISPONIBLE' | 'EN_PRET' | 'OUT_OF_SERVICE' | 'UNDER_REPAIR';

export interface Equipment {
  id: number;
  reference: string;
  equipmentName: string;
  location: string | null;
  acquisitionDate: string | null; // LocalDate côté back, 'YYYY-MM-DD'
  equipmentFamily: EquipmentFamily;
  status: EquipmentStatus | null; // @Transient, calculé côté service
}
