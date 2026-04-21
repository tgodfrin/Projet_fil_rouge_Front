import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface EquipementDetail {
  id: number;
  nom: string;
  reference: string;
  famille: string;
  localisation: string;
  statut: string;
  dateAcquisition: string;
  description: string;
  caracteristiques: { label: string; valeur: string }[];
  historique: { utilisateur: string; debut: string; fin: string; statut: string; label: string }[];
  documents: { nom: string; type: string; url: string }[];
}

const MOCK_EQUIPEMENTS: Record<number, EquipementDetail> = {
  1: {
    id: 1, nom: 'MacBook Pro M3', reference: 'REF-PC-042', famille: 'PC',
    localisation: 'Salle B204', statut: 'DISPONIBLE', dateAcquisition: '12/01/2024',
    description: 'MacBook Pro 14" puce M3, 16 Go RAM, 512 Go SSD',
    caracteristiques: [
      { label: 'Processeur', valeur: 'Apple M3 Pro' }, { label: 'RAM',       valeur: '16 Go'       },
      { label: 'Stockage',   valeur: '512 Go SSD'   }, { label: 'Écran',     valeur: '14" Retina'  },
      { label: 'Système',    valeur: 'macOS Sonoma'  }, { label: 'Autonomie', valeur: '18h'         },
    ],
    historique: [
      { utilisateur: 'Julie Fontaine', debut: '03/03/2026', fin: '10/03/2026', statut: 'TERMINE', label: 'Terminé'   },
      { utilisateur: 'Marc Durand',    debut: '01/03/2026', fin: '07/03/2026', statut: 'RETARD',  label: 'En retard' },
    ],
    documents: [
      { nom: 'Notice utilisateur',    type: 'Notice',         url: '#' },
      { nom: 'Fiche technique Apple', type: 'Doc. technique', url: '#' },
    ],
  },
  2: {
    id: 2, nom: 'Meta Quest 3', reference: 'REF-VR-008', famille: 'VR',
    localisation: 'Réserve', statut: 'EN_PRET', dateAcquisition: '20/09/2023',
    description: 'Casque VR autonome Meta Quest 3, 128 Go',
    caracteristiques: [
      { label: 'Stockage',    valeur: '128 Go'             }, { label: 'Résolution', valeur: '2064×2208 par œil' },
      { label: 'Autonomie',   valeur: '2h30'               }, { label: 'Connectique',valeur: 'USB-C'             },
    ],
    historique: [
      { utilisateur: 'Kevin Leclerc', debut: '12/04/2026', fin: '15/04/2026', statut: 'VALID', label: 'En cours' },
    ],
    documents: [],
  },
  3: {
    id: 3, nom: 'iPad Pro 12.9"', reference: 'REF-TAB-03', famille: 'Tablette',
    localisation: 'Salle A101', statut: 'DISPONIBLE', dateAcquisition: '14/04/2023',
    description: 'iPad Pro 12.9" M2, Wi-Fi, 256 Go',
    caracteristiques: [
      { label: 'Processeur', valeur: 'Apple M2'                    }, { label: 'Stockage',   valeur: '256 Go'   },
      { label: 'Écran',      valeur: '12.9" Liquid Retina'         }, { label: 'Connectique',valeur: 'USB-C'    },
    ],
    historique: [
      { utilisateur: 'Sophie Renard', debut: '08/04/2026', fin: '14/04/2026', statut: 'TERMINE', label: 'Terminé' },
    ],
    documents: [],
  },
  4: {
    id: 4, nom: 'Dell UltraSharp', reference: 'REF-ECR-12', famille: 'Écran',
    localisation: 'Salle B204', statut: 'DISPONIBLE', dateAcquisition: '01/02/2023',
    description: 'Moniteur Dell U2722D 27" 4K IPS',
    caracteristiques: [
      { label: 'Résolution', valeur: '4K UHD (3840×2160)'          }, { label: 'Dalle',      valeur: 'IPS'      },
      { label: 'Connectique',valeur: 'USB-C / DisplayPort / HDMI'  }, { label: 'Taille',     valeur: '27"'      },
    ],
    historique: [],
    documents: [],
  },
  5: {
    id: 5, nom: 'Sony WH-1000XM5', reference: 'REF-SON-07', famille: 'Audio',
    localisation: 'Réserve', statut: 'OUT_OF_SERVICE', dateAcquisition: '10/06/2023',
    description: 'Casque audio Sony WH-1000XM5, réduction de bruit active',
    caracteristiques: [
      { label: 'Autonomie',  valeur: '30h'      }, { label: 'Connectique', valeur: 'USB-C / Bluetooth 5.2' },
      { label: 'Réduction',  valeur: 'Active'   },
    ],
    historique: [],
    documents: [],
  },
  6: {
    id: 6, nom: 'HP EliteBook 840', reference: 'REF-PC-039', famille: 'PC',
    localisation: 'Salle B204', statut: 'DISPONIBLE', dateAcquisition: '05/03/2023',
    description: 'HP EliteBook 840 G9, Intel i7, 16 Go RAM',
    caracteristiques: [
      { label: 'Processeur', valeur: 'Intel Core i7-1255U' }, { label: 'RAM',     valeur: '16 Go'         },
      { label: 'Stockage',   valeur: '512 Go SSD'          }, { label: 'Système', valeur: 'Windows 11 Pro' },
    ],
    historique: [
      { utilisateur: 'Tom Vasseur', debut: '14/04/2026', fin: '22/04/2026', statut: 'VALID', label: 'En cours' },
    ],
    documents: [
      { nom: 'Manuel HP EliteBook', type: 'Notice', url: '#' },
    ],
  },
};

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent implements OnInit {

  ongletActif = signal<string>('infos');
  equipement = signal<EquipementDetail | null>(null);

  constructor(
    private route:    ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.equipement.set(MOCK_EQUIPEMENTS[id] ?? null);
  }

  retour(): void {
    this.location.back();
  }

  changerOnglet(onglet: string): void {
    this.ongletActif.set(onglet);
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      DISPONIBLE:     'Disponible',
      EN_PRET:        'En prêt',
      OUT_OF_SERVICE: 'Hors service',
      UNDER_REPAIR:   'En réparation',
      RETARD:         'En retard',
      TERMINE:        'Terminé',
      VALID:          'En cours',
    };
    return labels[statut] || statut;
  }
}
