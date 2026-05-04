import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentFormComponent } from './equipment-form/equipment-form';
// Type local mock — sera remplacé lors du branchement sur EquipmentService
interface Equipement { nom: string; reference: string; famille: string; localisation: string; statut: string; }
import { ExportComponent } from '../../../shared/export/export';

interface EquipementItem {
  id: number;
  nom: string;
  reference: string;
  famille: string;
  localisation: string;
  statut: string;
  composants?: { type: string; valeur: string }[];
}

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [FormsModule, CommonModule, EquipmentFormComponent, ExportComponent],
  templateUrl: './equipment.html',
  styleUrl: './equipment.scss'
})
export class EquipmentComponent {

  constructor(private router: Router) {}

  modalOuvert: boolean = false;

  filtreActif: string = 'tous';
  recherche: string = '';
  familles: string = 'toutes';
  pageCourante: number = 1;
  itemsParPage: number = 10;

  equipements: EquipementItem[] = [
    { id: 1,  nom: 'MacBook Pro M3',     reference: 'REF-PC-042',  famille: 'PC',           localisation: 'Salle B204', statut: 'DISPONIBLE'     },
    { id: 2,  nom: 'Meta Quest 3',       reference: 'REF-VR-008',  famille: 'VR',           localisation: 'Réserve',    statut: 'EN_PRET'        },
    { id: 3,  nom: 'iPad Pro 12.9"',     reference: 'REF-TAB-03',  famille: 'Tablette',     localisation: 'Salle A101', statut: 'DISPONIBLE'     },
    { id: 4,  nom: 'Dell UltraSharp',    reference: 'REF-ECR-12',  famille: 'Écran',        localisation: 'Salle B204', statut: 'DISPONIBLE'     },
    { id: 5,  nom: 'Sony WH-1000XM5',   reference: 'REF-SON-07',  famille: 'Audio',        localisation: 'Réserve',    statut: 'OUT_OF_SERVICE' },
    { id: 6,  nom: 'HP EliteBook 840',   reference: 'REF-PC-039',  famille: 'PC',           localisation: 'Salle B204', statut: 'DISPONIBLE'     },
    { id: 7,  nom: 'Clavier Keychron',   reference: 'REF-PER-015', famille: 'Périphérique', localisation: 'Réserve',    statut: 'DISPONIBLE'     },
    { id: 8,  nom: 'Samsung Galaxy Tab', reference: 'REF-TAB-04',  famille: 'Tablette',     localisation: 'Salle A101', statut: 'EN_PRET'        },
    { id: 9,  nom: 'MacBook Pro M2',     reference: 'REF-PC-043',  famille: 'PC',           localisation: 'Salle B204', statut: 'DISPONIBLE'     },
    { id: 10, nom: 'Meta Quest 2',       reference: 'REF-VR-001',  famille: 'VR',           localisation: 'Réserve',    statut: 'EN_PRET'        },
    { id: 11, nom: 'iPad Pro 13"',       reference: 'REF-TAB-44',  famille: 'Tablette',     localisation: 'Salle A101', statut: 'DISPONIBLE'     },
    { id: 12, nom: 'Dell UltraSharp 2',  reference: 'REF-ECR-13',  famille: 'Écran',        localisation: 'Salle B204', statut: 'DISPONIBLE'     },
    { id: 13, nom: 'Sony WH-1000XM6',   reference: 'REF-SON-022', famille: 'Audio',        localisation: 'Réserve',    statut: 'OUT_OF_SERVICE' },
    { id: 14, nom: 'HP EliteBook 845',   reference: 'REF-PC-034',  famille: 'PC',           localisation: 'Salle B204', statut: 'DISPONIBLE'     },
    { id: 15, nom: 'Clavier Keychron 2', reference: 'REF-PER-017', famille: 'Périphérique', localisation: 'Réserve',    statut: 'DISPONIBLE'     },
    { id: 16, nom: 'Samsung Galaxy Tab3',reference: 'REF-TAB-46',  famille: 'Tablette',     localisation: 'Salle A101', statut: 'EN_PRET'        },
  ];

  famillesDisponibles = ['toutes', 'PC', 'VR', 'Tablette', 'Écran', 'Audio', 'Périphérique'];

  get equipementsFiltres() {
    return this.equipements.filter(e => {
      const matchStatut  = this.filtreActif === 'tous' || e.statut === this.filtreActif;
      const matchRecherche = e.nom.toLowerCase().includes(this.recherche.toLowerCase());
      const matchFamille = this.familles === 'toutes' || e.famille === this.familles;
      return matchStatut && matchRecherche && matchFamille;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.equipementsFiltres.length / this.itemsParPage);
  }

  get equipementsPagines() {
    const debut = (this.pageCourante - 1) * this.itemsParPage;
    return this.equipementsFiltres.slice(debut, debut + this.itemsParPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get debutIndex(): number {
    return (this.pageCourante - 1) * this.itemsParPage + 1;
  }

  get finIndex(): number {
    return Math.min(this.pageCourante * this.itemsParPage, this.equipementsFiltres.length);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageCourante = page;
    }
  }

  onFiltreChange(): void {
    this.pageCourante = 1;
  }

  get totalTous()        { return this.equipements.length; }
  get totalDisponibles() { return this.equipements.filter(e => e.statut === 'DISPONIBLE').length; }
  get totalEnPret()      { return this.equipements.filter(e => e.statut === 'EN_PRET').length; }
  get totalHorsService() { return this.equipements.filter(e => e.statut === 'OUT_OF_SERVICE' || e.statut === 'UNDER_REPAIR').length; }

  get equipementsExport() {
    return this.equipements.map(e => ({
      nom: e.nom,
      reference: e.reference,
      famille: e.famille,
      localisation: e.localisation,
      statut: this.getStatutLabel(e.statut)
    }));
  }

  ouvrirModal(): void  { this.modalOuvert = true; }
  fermerModal(): void  { this.modalOuvert = false; }

  onAjouter(eq: Equipement): void {
    const newId = Math.max(...this.equipements.map(e => e.id), 0) + 1;
    const item: EquipementItem = { id: newId, ...eq };
    this.equipements = [item, ...this.equipements];
    this.famillesDisponibles = ['toutes', ...new Set(this.equipements.map(e => e.famille))];
    this.onFiltreChange();
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/equipements', id]);
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      DISPONIBLE:     'Disponible',
      EN_PRET:        'En prêt',
      OUT_OF_SERVICE: 'Hors service',
      UNDER_REPAIR:   'En réparation',
    };
    return labels[statut] || statut;
  }
}