import { Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { LoanService } from '../../../core/services/loan.service';
import { Equipment } from '../../../core/models/equipment.model';
import { Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {

  private router           = inject(Router);
  private equipmentService = inject(EquipmentService);
  private loanService      = inject(LoanService);

  private equipments = toSignal(this.equipmentService.getAll(), { initialValue: [] as Equipment[] });

  // Chargement ciblé côté serveur — évite de charger tous les loans juste pour filtrer
  private retardLoans  = toSignal(this.loanService.getOverdue(),  { initialValue: [] as Loan[] });
  private pendingLoans = toSignal(this.loanService.getPending(),  { initialValue: [] as Loan[] });

  // KPIs équipements
  kpis = computed(() => [
    { label: 'Total matériels', value: this.equipments().length,                                                                          color: 'var(--grey-900)' },
    { label: 'Disponibles',     value: this.equipments().filter(e => e.status === 'DISPONIBLE').length,                                   color: 'var(--success)'  },
    { label: 'En prêt',         value: this.equipments().filter(e => e.status === 'EN_PRET').length,                                      color: 'var(--warning)'  },
    { label: 'Hors service',    value: this.equipments().filter(e => e.status === 'OUT_OF_SERVICE' || e.status === 'UNDER_REPAIR').length, color: 'var(--danger)'   },
  ]);

  // Banners d'alerte — affichées seulement si count > 0
  alertes = computed(() => {
    const list = [];
    if (this.retardLoans().length > 0) {
      list.push({ type: 'danger',  titre: `${this.retardLoans().length} retard(s) de retour`,    btnLabel: 'Voir', route: '/alertes'  });
    }
    if (this.pendingLoans().length > 0) {
      list.push({ type: 'warning', titre: `${this.pendingLoans().length} demande(s) en attente`, btnLabel: 'Voir', route: '/emprunts' });
    }
    return list;
  });

  // Tableau de notifications : retards + demandes en attente
  notifications = computed(() => {
    const retards = this.retardLoans().map(l => ({
      id:          `retard-${l.id}`,
      utilisateur: `${l.requester.name} ${l.requester.lastname}`,
      materiel:    l.equipment.equipmentName,
      dates:       `${this.formatDate(l.beginDate)} au ${this.formatDate(l.endDate)}`,
      statut:      'danger' as const,
      label:       'Retard',
    }));
    const pending = this.pendingLoans().map(l => ({
      id:          `pending-${l.id}`,
      utilisateur: `${l.requester.name} ${l.requester.lastname}`,
      materiel:    l.equipment.equipmentName,
      dates:       `${this.formatDate(l.beginDate)} au ${this.formatDate(l.endDate)}`,
      statut:      'warning' as const,
      label:       'Attente',
    }));
    return [...retards, ...pending];
  });

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}