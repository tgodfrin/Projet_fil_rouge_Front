import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class DashboardComponent {
  // KPIs
  kpis = [
    { label: 'Total matériels', value: 124, color: 'var(--grey-900)' },
    { label: 'Disponibles',     value: 87,  color: 'var(--success)'  },
    { label: 'En prêt',         value: 31,  color: 'var(--warning)'  },
    { label: 'Hors service',    value: 6,   color: 'var(--danger)'   },
  ];

  // Alertes
  alertes = [
    {
      type: 'danger',
      titre: '3 retards de retour',
      detail: 'MacBook M3 — Dell 27" — Quest 3',
      btnLabel: 'Voir'
    },
    {
      type: 'warning',
      titre: '2 demandes en attente',
      detail: 'Julie F. — Kevin L.',
      btnLabel: 'Valider'
    },
  ];

  // Demandes récentes
  demandes = [
    { utilisateur: 'Julie Fontaine', dates: '3 au 10 mars',  materiel: 'iPad Pro',   statut: 'warning', label: 'Attente' },
    { utilisateur: 'Kevin Leclerc',  dates: '5 au 8 mars',   materiel: 'Quest 3',    statut: 'warning', label: 'Attente' },
    { utilisateur: 'Marc Durand',    dates: '1 au 7 mars',   materiel: 'MacBook M3', statut: 'danger',  label: 'Retard'  },
  ];
}