// Correspond à l'entité EquipmentFamily côté back
// Sérialisé via la vue EquipmentFamilyView : id et nameEquipmentFamily.
// Endpoint : GET /equipment-family/list
export interface EquipmentFamily {
  id: number;
  nameEquipmentFamily: string;
}
