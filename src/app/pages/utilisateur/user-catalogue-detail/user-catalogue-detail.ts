import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EquipmentStatus, EquipmentCategory } from '../user-catalogue/user-catalogue';

interface CatalogueDetailItem {
  id: number;
  name: string;
  ref: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  localisation: string;
  dateAcquisition: string;
  description: string;
  caracteristiques: { label: string; valeur: string }[];
}

@Component({
  selector: 'app-user-catalogue-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-catalogue-detail.html',
  styleUrl: './user-catalogue-detail.scss'
})
export class UserCatalogueDetailComponent {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  // Données mock (à remplacer par un appel service)
  private catalogue: CatalogueDetailItem[] = [
    {
      id: 1, name: 'MacBook Pro M3', ref: 'REF-PC-042', category: 'PC',
      status: 'DISPONIBLE', localisation: 'Salle B204', dateAcquisition: '12/01/2024',
      description: 'MacBook Pro 14" puce M3, 16 Go RAM, 512 Go SSD',
      caracteristiques: [
        { label: 'Processeur',  valeur: 'Apple M3 Pro' },
        { label: 'RAM',         valeur: '16 Go'        },
        { label: 'Stockage',    valeur: '512 Go SSD'   },
        { label: 'Écran',       valeur: '14" Retina'   },
        { label: 'Système',     valeur: 'macOS Sonoma' },
        { label: 'Autonomie',   valeur: '18h'          },
      ]
    },
    {
      id: 2, name: 'HP EliteBook 840', ref: 'REF-PC-031', category: 'PC',
      status: 'EN_PRET', localisation: 'Salle A101', dateAcquisition: '05/03/2023',
      description: 'HP EliteBook 840 G9, Intel i7, 16 Go RAM',
      caracteristiques: [
        { label: 'Processeur', valeur: 'Intel Core i7-1255U' },
        { label: 'RAM',        valeur: '16 Go'               },
        { label: 'Stockage',   valeur: '512 Go SSD'          },
        { label: 'Écran',      valeur: '14" FHD'             },
        { label: 'Système',    valeur: 'Windows 11 Pro'      },
      ]
    },
    {
      id: 3, name: 'Meta Quest 3', ref: 'REF-VR-008', category: 'VR',
      status: 'EN_PRET', localisation: 'Labo VR', dateAcquisition: '20/09/2023',
      description: 'Casque VR autonome Meta Quest 3, 128 Go',
      caracteristiques: [
        { label: 'Stockage',   valeur: '128 Go'          },
        { label: 'Résolution', valeur: '2064×2208 par œil'},
        { label: 'Autonomie',  valeur: '2h30'            },
        { label: 'Connectique',valeur: 'USB-C'           },
      ]
    },
    {
      id: 4, name: 'iPad Pro 12.9"', ref: 'REF-TAB-007', category: 'Tablette',
      status: 'DISPONIBLE', localisation: 'Médiathèque', dateAcquisition: '14/04/2023',
      description: 'iPad Pro 12.9" M2, Wi-Fi, 256 Go',
      caracteristiques: [
        { label: 'Processeur', valeur: 'Apple M2'    },
        { label: 'Stockage',   valeur: '256 Go'      },
        { label: 'Écran',      valeur: '12.9" Liquid Retina' },
        { label: 'Connectique',valeur: 'USB-C / Magic Connector' },
      ]
    },
    {
      id: 5, name: 'Samsung Galaxy Tab', ref: 'REF-TAB-012', category: 'Tablette',
      status: 'DISPONIBLE', localisation: 'Salle B204', dateAcquisition: '08/06/2023',
      description: 'Samsung Galaxy Tab S9+, 256 Go',
      caracteristiques: [
        { label: 'Processeur', valeur: 'Snapdragon 8 Gen 2' },
        { label: 'Stockage',   valeur: '256 Go'             },
        { label: 'Écran',      valeur: '12.4" AMOLED'       },
        { label: 'Système',    valeur: 'Android 14'         },
      ]
    },
    {
      id: 6, name: 'Dell UltraSharp 27"', ref: 'REF-ECR-003', category: 'Écran',
      status: 'DISPONIBLE', localisation: 'Open Space', dateAcquisition: '01/02/2023',
      description: 'Moniteur Dell U2722D 27" 4K IPS',
      caracteristiques: [
        { label: 'Résolution', valeur: '4K UHD (3840×2160)' },
        { label: 'Dalle',      valeur: 'IPS'                },
        { label: 'Connectique',valeur: 'USB-C / DisplayPort / HDMI' },
        { label: 'Taille',     valeur: '27"'                },
      ]
    },
    {
      id: 7, name: 'LG 4K 32"', ref: 'REF-ECR-009', category: 'Écran',
      status: 'OUT_OF_SERVICE', localisation: 'Réserve', dateAcquisition: '10/10/2022',
      description: 'LG UltraFine 32UN880 32" 4K',
      caracteristiques: [
        { label: 'Résolution', valeur: '4K UHD (3840×2160)' },
        { label: 'Dalle',      valeur: 'IPS'                },
        { label: 'Connectique',valeur: 'USB-C Thunderbolt'  },
        { label: 'Taille',     valeur: '32"'                },
      ]
    },
    {
      id: 8, name: 'Clavier Keychron K2', ref: 'REF-PER-015', category: 'Périphérique',
      status: 'DISPONIBLE', localisation: 'Open Space', dateAcquisition: '22/05/2023',
      description: 'Clavier mécanique compact 75%, switches Brown',
      caracteristiques: [
        { label: 'Format',     valeur: '75% (84 touches)' },
        { label: 'Switches',   valeur: 'Gateron Brown'    },
        { label: 'Connectique',valeur: 'USB-C / Bluetooth'},
        { label: 'Rétroéclairage', valeur: 'RGB'         },
      ]
    },
    {
      id: 9, name: 'Souris Logitech MX', ref: 'REF-PER-021', category: 'Périphérique',
      status: 'EN_PRET', localisation: 'Réserve', dateAcquisition: '11/07/2023',
      description: 'Logitech MX Master 3S, sans fil',
      caracteristiques: [
        { label: 'DPI',        valeur: '200–8000 DPI'   },
        { label: 'Connectique',valeur: 'USB-C / Logi Bolt / Bluetooth' },
        { label: 'Autonomie',  valeur: '70 jours'       },
        { label: 'Poids',      valeur: '141 g'          },
      ]
    },
  ];

  equipement = computed<CatalogueDetailItem | null>(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.catalogue.find(e => e.id === id) ?? null;
  });

  getStatusLabel(status: EquipmentStatus): string {
    const labels: Record<EquipmentStatus, string> = {
      DISPONIBLE:     'Disponible',
      EN_PRET:        'En prêt',
      OUT_OF_SERVICE: 'Hors service',
      UNDER_REPAIR:   'En réparation',
    };
    return labels[status];
  }

  getStatusClass(status: EquipmentStatus): string {
    const classes: Record<EquipmentStatus, string> = {
      DISPONIBLE:     'b-success',
      EN_PRET:        'b-warning',
      OUT_OF_SERVICE: 'b-danger',
      UNDER_REPAIR:   'b-danger',
    };
    return classes[status];
  }

  getCategoryIcon(category: EquipmentCategory): string {
    const icons: Record<EquipmentCategory, string> = {
      'PC': '💻', 'VR': '🥽', 'Tablette': '📱', 'Écran': '🖥️', 'Périphérique': '🖱️'
    };
    return icons[category];
  }

  retour(): void {
    this.router.navigate(['/utilisateur/catalogue']);
  }
}
