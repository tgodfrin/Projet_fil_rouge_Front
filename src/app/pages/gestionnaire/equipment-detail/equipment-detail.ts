import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent {

  constructor(private location: Location) {}

  ongletActif: string = 'infos';

  equipement = {
    nom: 'MacBook Pro M3',
    reference: 'REF-PC-042',
    famille: 'PC',
    localisation: 'Salle B204',
    statut: 'disponible',
    dateAcquisition: '12/01/2024',
    description: 'MacBook Pro 14" puce M3, 16Go RAM, 512Go SSD'
  };

  caracteristiques = [
    { label: 'Processeur',  valeur: 'Apple M3 Pro' },
    { label: 'RAM',         valeur: '18 Go'         },
    { label: 'Stockage',    valeur: '512 Go SSD'    },
    { label: 'Écran',       valeur: '14" Retina'    },
    { label: 'Système',     valeur: 'macOS Sonoma'  },
    { label: 'Autonomie',   valeur: '18h'           },
  ];

  historique = [
    { utilisateur: 'Julie Fontaine', debut: '03/03/2026', fin: '10/03/2026', statut: 'termine',   label: 'Terminé'   },
    { utilisateur: 'Kevin Leclerc',  debut: '15/02/2026', fin: '20/02/2026', statut: 'termine',   label: 'Terminé'   },
    { utilisateur: 'Marc Durand',    debut: '01/03/2026', fin: '07/03/2026', statut: 'en-retard', label: 'En retard' },
  ];

  documents = [
    { nom: 'Notice utilisateur',    type: 'Notice',        url: '#' },
    { nom: 'Fiche technique Apple', type: 'Doc. technique', url: '#' },
  ];

  retour(): void {
    this.location.back();
  }

  changerOnglet(onglet: string): void {
    this.ongletActif = onglet;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'disponible':   'Disponible',
      'en-pret':      'En prêt',
      'hors-service': 'Hors service',
      'en-retard':    'En retard',
      'termine':      'Terminé',
    };
    return labels[statut] || statut;
  }
}