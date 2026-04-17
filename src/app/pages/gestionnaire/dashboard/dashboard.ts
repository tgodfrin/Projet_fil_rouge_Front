import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {

  constructor(private router: Router) {}

  kpis = [
    { label: 'Total matériels', value: 124, color: 'var(--grey-900)' },
    { label: 'Disponibles',     value: 87,  color: 'var(--success)'  },
    { label: 'En prêt',         value: 31,  color: 'var(--warning)'  },
    { label: 'Hors service',    value: 6,   color: 'var(--danger)'   },
  ];

  alertes = [
    {
      type: 'danger',
      titre: '3 retards de retour',
      btnLabel: 'Voir',
      route: '/alertes'
    },
    {
      type: 'warning',
      titre: '2 demandes en attente',
      btnLabel: 'Valider',
      route: '/emprunts'
    },
  ];

  notifications = [
    { utilisateur: 'Julie Fontaine', dates: '3 au 10 mars',  materiel: 'iPad Pro',   statut: 'warning', label: 'Attente' },
    { utilisateur: 'Kevin Leclerc',  dates: '5 au 8 mars',   materiel: 'Quest 3',    statut: 'warning', label: 'Attente' },
    { utilisateur: 'Marc Durand',    dates: '1 au 7 mars',   materiel: 'MacBook M3', statut: 'danger',  label: 'Retard'  },
  ];

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}