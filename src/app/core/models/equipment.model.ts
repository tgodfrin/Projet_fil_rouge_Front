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
//   DISPONIBLE     → aucun emprunt actif + aucun StatusEquipment ouvert
//   EN_PRET        → emprunt IN_PROGRESS en cours
//   OUT_OF_SERVICE → StatusEquipment de type OUT_OF_SERVICE non résolu
//   UNDER_REPAIR   → StatusEquipment de type UNDER_REPAIR non résolu
export type EquipmentStatus = 'DISPONIBLE' | 'EN_PRET' | 'OUT_OF_SERVICE' | 'UNDER_REPAIR';

export interface Equipment {
  id: number;
  reference: string;
  equipmentName: string;
  location: string | null;
  acquisitionDate: string | null; // LocalDate → 'YYYY-MM-DD'
  equipmentFamily: EquipmentFamily;
  status: EquipmentStatus | null; // @Transient, calculé côté service
}
