// Correspond à l'entité StatusEquipment + l'enum StatusEquipmentType côté back
// Sérialisé via @JsonView(StatusEquipmentView)
// Endpoints :
//   GET  /status-equipment/equipment/:equipmentId
//   POST /status-equipment
//   PUT  /status-equipment/:id/resolve

// OUT_OF_SERVICE = panne | UNDER_REPAIR = en réparation
export type StatusEquipmentType = 'OUT_OF_SERVICE' | 'UNDER_REPAIR';

export interface StatusEquipment {
  id: number;
  beginStatusDate: string;        // LocalDateTime → ISO string (@CreationTimestamp)
  endStatusDate: string | null;   // null tant que non résolu
  descriptionStatus: string | null;
  statusEquipmentType: StatusEquipmentType;
  // id, reference, equipmentName exposés via @JsonView(StatusEquipmentView) sur Equipment
  // location, acquisitionDate, equipmentFamily, status → non exposés dans ce contexte
  equipment: { id: number; reference: string; equipmentName: string };
}

// Body attendu par POST /status-equipment — aligné avec StatusEquipmentRequest.java
export interface StatusEquipmentCreate {
  statusEquipmentType: StatusEquipmentType;
  descriptionStatus: string;
  equipmentId: number;
}
