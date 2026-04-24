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

export type EquipmentStatus = 'DISPONIBLE' | 'EN_PRET' | 'OUT_OF_SERVICE' | 'UNDER_REPAIR';

// Les catégories viennent dynamiquement de l'API (EquipmentFamily) — ne pas hardcoder
export interface CatalogueItem {
  id: number;
  name: string;
  ref: string;
  category: string;
  status: EquipmentStatus;
}
