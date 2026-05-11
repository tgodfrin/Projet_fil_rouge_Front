import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EventService } from '../../../core/services/event.service';
import { LoanService } from '../../../core/services/loan.service';
import { Event } from '../../../core/models/event.model';
import { Loan } from '../../../core/models/loan.model';
import { Alert, AlertType } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.scss'
})
export class AlertListComponent {

  private router       = inject(Router);
  private eventService = inject(EventService);
  private loanService  = inject(LoanService);

  // Loans via toSignal (pas de mutation dessus)
  private loans = toSignal(this.loanService.getAll(), { initialValue: [] as Loan[] });

  // Events non lus : writable signal pour recharger après markAsRead
  private events = signal<Event[]>([]);

  constructor() {
    this.chargerEvents();
  }

  private chargerEvents(): void {
    this.eventService.getUnread().subscribe(data => this.events.set(data));
  }

  activeTab = signal<'TOUTES' | AlertType>('TOUTES');

  // Agrégation Events + Retards dans une seule liste d'alertes UI
  private allAlerts = computed((): Alert[] => {
    const eventAlerts: Alert[] = this.events().map(e => {
      const loan = this.loans().find(l => l.id === e.loan.id);
      return {
        id:            e.id,
        loanId:        e.loan.id,
        type:          e.type,
        equipmentName: loan?.equipment?.equipmentName ?? '—',
        borrowerName:  loan ? `${loan.requester.name} ${loan.requester.lastname}` : '—',
        description:   e.description ?? '',
        date:          e.createdAt,
        read:          e.readingDate !== null,
      };
    });

    const retardAlerts: Alert[] = this.loans()
      .filter(l => l.statusType === 'VALID' && new Date(l.endDate) < new Date())
      .map(l => ({
        id:            l.id,
        loanId:        l.id,
        type:          'RETARD' as AlertType,
        equipmentName: l.equipment.equipmentName,
        borrowerName:  `${l.requester.name} ${l.requester.lastname}`,
        description:   `Retour prévu le ${new Date(l.endDate).toLocaleDateString('fr-FR')}`,
        date:          l.endDate,
        read:          false,
      }));

    return [...retardAlerts, ...eventAlerts];
  });

  filteredAlerts = computed(() => {
    const tab = this.activeTab();
    if (tab === 'TOUTES') return this.allAlerts();
    return this.allAlerts().filter(a => a.type === tab);
  });

  countByType(type: AlertType | 'TOUTES'): number {
    if (type === 'TOUTES') return this.allAlerts().length;
    return this.allAlerts().filter(a => a.type === type).length;
  }

  unreadCount(): number {
    return this.allAlerts().filter(a => !a.read).length;
  }

  retardCount(): number {
    return this.allAlerts().filter(a => a.type === 'RETARD').length;
  }

  panneCount(): number {
    return this.allAlerts().filter(a => a.type === 'BREAKDOWN').length;
  }

  setTab(tab: 'TOUTES' | AlertType): void {
    this.activeTab.set(tab);
  }

  markAsRead(alert: Alert): void {
    // Les RETARD sont calculés côté front → pas d'entité Event à marquer
    if (alert.type !== 'RETARD') {
      this.eventService.markAsRead(alert.id).subscribe(() => this.chargerEvents());
    }
  }

  markAllAsRead(): void {
    const unreadEvents = this.allAlerts().filter(a => !a.read && a.type !== 'RETARD');
    let pending = unreadEvents.length;
    if (pending === 0) return;
    unreadEvents.forEach(a => {
      this.eventService.markAsRead(a.id).subscribe(() => {
        pending--;
        if (pending === 0) this.chargerEvents();
      });
    });
  }

  voirEmprunt(alert: Alert): void {
    this.markAsRead(alert);
    this.router.navigate(['/emprunts', alert.loanId]);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}