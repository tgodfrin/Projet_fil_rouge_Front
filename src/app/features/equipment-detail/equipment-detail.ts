import { Component } from '@angular/core';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent {

  // Onglet actif
  ongletActif: string = 'infos';

  // Données mockées de l'équipement
  equipement = {
    nom: 'MacBook Pro M3',
    reference: 'REF-PC-042',
    famille: 'PC',
    localisation: 'Salle B204',
    statut: 'disponible',
    dateAcquisition: '12/01/2024',
    description: 'MacBook Pro 14" puce M3, 16Go RAM, 512Go SSD'
  };

  // Historique des emprunts mockés
  historique = [
    { utilisateur: 'Julie Fontaine', debut: '03/03/2026', fin: '10/03/2026', statut: 'termine',   label: 'Terminé'  },
    { utilisateur: 'Kevin Leclerc',  debut: '15/02/2026', fin: '20/02/2026', statut: 'termine',   label: 'Terminé'  },
    { utilisateur: 'Marc Durand',    debut: '01/03/2026', fin: '07/03/2026', statut: 'en-retard', label: 'En retard'},
  ];

  // Documents mockés
  documents = [
    { nom: 'Notice utilisateur',    type: 'NOTICE',        url: '#' },
    { nom: 'Fiche technique Apple', type: 'DOC_TECHNIQUE', url: '#' },
  ];

  // Méthode pour changer d'onglet
  changerOnglet(onglet: string): void {
    this.ongletActif = onglet;
  }

  // Libellé du statut
  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'disponible':  'Disponible',
      'en-pret':     'En prêt',
      'hors-service':'Hors service',
      'en-retard':   'En retard',
      'termine':     'Terminé',
    };
    return labels[statut] || statut;
  }
}