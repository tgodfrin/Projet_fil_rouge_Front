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

  // All events (read + unread) — avoids incidents disappearing after markAsRead + navigation
  private events = signal<Event[]>([]);

  // Local tracking for retard alerts seen in this session (no back entity for retards)
  private readRetardIds = signal<Set<number>>(new Set());

  constructor() {
    this.chargerEvents();
  }

  private chargerEvents(): void {
    // Load all events so read incidents stay visible when user navigates back
    this.eventService.getAll().subscribe(data => this.events.set(data));
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
        read:          this.readRetardIds().has(l.id),
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
    if (alert.type === 'RETARD') {
      // RETARD is front-only — track seen retard loan ids locally
      this.readRetardIds.update(s => new Set([...s, alert.loanId]));
      return;
    }
    this.eventService.markAsRead(alert.id).subscribe(() => {
      // Update locally so the card stays visible but switches to "read" state
      this.events.update(events =>
        events.map(e => e.id === alert.id ? { ...e, readingDate: new Date().toISOString() } : e)
      );
    });
  }

  // Returns the display label for an alert type
  getAlertLabel(type: AlertType): string {
    const labels: Record<AlertType, string> = {
      RETARD:       'Retard',
      BREAKDOWN:    'Incident',
      EARLY_RETURN: 'Retour anticipé',
      EXTENSION:    'Extension',
    };
    return labels[type] ?? type;
  }

  markAllAsRead(): void {
    const unreadEvents = this.allAlerts().filter(a => !a.read && a.type !== 'RETARD');
    if (unreadEvents.length === 0) return;
    unreadEvents.forEach(a => {
      this.eventService.markAsRead(a.id).subscribe(() => {
        // Mise à jour locale par événement — la carte reste visible
        this.events.update(events =>
          events.map(e => e.id === a.id ? { ...e, readingDate: new Date().toISOString() } : e)
        );
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