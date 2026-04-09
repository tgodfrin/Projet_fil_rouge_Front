import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './equipment.html',
  styleUrl: './equipment.scss'
})
export class EquipmentComponent {

  // Filtre actif
  filtreActif: string = 'tous';

  // Recherche
  recherche: string = '';

  // Données mockées
  equipements = [
    { nom: 'MacBook Pro M3',   reference: 'REF-PC-042', famille: 'PC',      localisation: 'Salle B204', statut: 'disponible' },
    { nom: 'Meta Quest 3',     reference: 'REF-VR-008', famille: 'VR',      localisation: 'Réserve',    statut: 'en-pret'    },
    { nom: 'iPad Pro 12.9"',   reference: 'REF-TAB-03', famille: 'Tablette',localisation: 'Salle A101', statut: 'disponible' },
    { nom: 'Dell UltraSharp',  reference: 'REF-ECR-12', famille: 'Écran',   localisation: 'Salle B204', statut: 'disponible' },
    { nom: 'Sony WH-1000XM5', reference: 'REF-SON-07', famille: 'Audio',   localisation: 'Réserve',    statut: 'hors-service'},
  ];

  // Compteurs pour les badges
  get totalTous()        { return this.equipements.length; }
  get totalDisponibles() { return this.equipements.filter(e => e.statut === 'disponible').length; }
  get totalEnPret()      { return this.equipements.filter(e => e.statut === 'en-pret').length; }
  get totalHorsService() { return this.equipements.filter(e => e.statut === 'hors-service').length; }

  // Équipements filtrés selon filtre actif + recherche
  get equipementsFiltres() {
    return this.equipements.filter(e => {
      const matchFiltre = this.filtreActif === 'tous' || e.statut === this.filtreActif;
      const matchRecherche = e.nom.toLowerCase().includes(this.recherche.toLowerCase());
      return matchFiltre && matchRecherche;
    });
  }

  // Libellé du statut
  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'disponible':  'Disponible',
      'en-pret':     'En prêt',
      'hors-service':'Hors service',
    };
    return labels[statut] || statut;
  }
}