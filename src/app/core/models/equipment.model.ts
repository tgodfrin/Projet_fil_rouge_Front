export interface Composant {
  type: string;
  valeur: string;
}

export interface Equipement {
  nom: string;
  reference: string;
  famille: string;
  localisation: string;
  statut: string;
  composants: Composant[];
}

export type EquipmentStatus = 'DISPONIBLE' | 'EN_PRET' | 'HORS_SERVICE';

export type EquipmentCategory = 'PC' | 'VR' | 'Tablette' | 'Écran' | 'Périphérique';

export interface CatalogueItem {
  id: number;
  name: string;
  ref: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
}
