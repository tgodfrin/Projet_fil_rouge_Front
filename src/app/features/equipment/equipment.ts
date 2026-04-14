import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './equipment.html',
  styleUrl: './equipment.scss'
})
export class EquipmentComponent {

  filtreActif: string = 'tous';
  recherche: string = '';
  familles: string = 'toutes';
  pageCourante: number = 1;
  itemsParPage: number = 10;

  equipements = [
    { nom: 'MacBook Pro M3',    reference: 'REF-PC-042',  famille: 'PC',       localisation: 'Salle B204', statut: 'disponible'  },
    { nom: 'Meta Quest 3',      reference: 'REF-VR-008',  famille: 'VR',       localisation: 'Réserve',    statut: 'en-pret'     },
    { nom: 'iPad Pro 12.9"',    reference: 'REF-TAB-03',  famille: 'Tablette', localisation: 'Salle A101', statut: 'disponible'  },
    { nom: 'Dell UltraSharp',   reference: 'REF-ECR-12',  famille: 'Écran',    localisation: 'Salle B204', statut: 'disponible'  },
    { nom: 'Sony WH-1000XM5',  reference: 'REF-SON-07',  famille: 'Audio',    localisation: 'Réserve',    statut: 'hors-service'},
    { nom: 'HP EliteBook 840',  reference: 'REF-PC-039',  famille: 'PC',       localisation: 'Salle B204', statut: 'disponible'  },
    { nom: 'Clavier Keychron',  reference: 'REF-PER-015', famille: 'Périphérique', localisation: 'Réserve', statut: 'disponible' },
    { nom: 'Samsung Galaxy Tab',reference: 'REF-TAB-04',  famille: 'Tablette', localisation: 'Salle A101', statut: 'en-pret'     },

    { nom: 'MacBook Pro M2',    reference: 'REF-PC-043',  famille: 'PC',       localisation: 'Salle B204', statut: 'disponible'  },
    { nom: 'Meta Quest ',      reference: 'REF-VR-001',  famille: 'VR',       localisation: 'Réserve',    statut: 'en-pret'     },
    { nom: 'iPad Pro 13"',    reference: 'REF-TAB-44',  famille: 'Tablette', localisation: 'Salle A101', statut: 'disponible'  },
    { nom: 'Dell UltraSharp 2',   reference: 'REF-ECR-13',  famille: 'Écran',    localisation: 'Salle B204', statut: 'disponible'  },
    { nom: 'Sony WH-1000XM6',  reference: 'REF-SON-022',  famille: 'Audio',    localisation: 'Réserve',    statut: 'hors-service'},
    { nom: 'HP EliteBook 845',  reference: 'REF-PC-034',  famille: 'PC',       localisation: 'Salle B204', statut: 'disponible'  },
    { nom: 'Clavier Keychron 32',  reference: 'REF-PER-017', famille: 'Périphérique', localisation: 'Réserve', statut: 'disponible' },
    { nom: 'Samsung Galaxy Tab3',reference: 'REF-TAB-46',  famille: 'Tablette', localisation: 'Salle A101', statut: 'en-pret'     },
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
  get totalDisponibles() { return this.equipements.filter(e => e.statut === 'disponible').length; }
  get totalEnPret()      { return this.equipements.filter(e => e.statut === 'en-pret').length; }
  get totalHorsService() { return this.equipements.filter(e => e.statut === 'hors-service').length; }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'disponible':   'Disponible',
      'en-pret':      'En prêt',
      'hors-service': 'Hors service',
    };
    return labels[statut] || statut;
  }
}