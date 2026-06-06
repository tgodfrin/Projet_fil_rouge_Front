// Correspond à l'enum ProfilType + l'entité Profil côté back
// Sérialisé via la vue AppUserView : id, type et equipmentFamilies.
// Endpoint : GET /profil/list

import { EquipmentFamily } from './equipment-family.model';

export type ProfilType = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';

export interface Profil {
  id: number;
  type: ProfilType;
  equipmentFamilies: EquipmentFamily[];
}
