// Correspond à l'entité EquipmentFamily côté back
// Sérialisé via @JsonView(EquipmentFamilyView) → id + nameEquipmentFamily
// Endpoint : GET /equipment-family/list
export interface EquipmentFamily {
  id: number;
  nameEquipmentFamily: string;
}
