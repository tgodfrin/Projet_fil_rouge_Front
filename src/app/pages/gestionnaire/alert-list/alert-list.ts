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

  // IDs des alertes en cours de traitement (pour désactiver le bouton pendant la requête)
  processingIds = signal<Set<number>>(new Set());

  // Retards vus — persistés dans sessionStorage pour survivre aux navigations
  private readonly SESSION_KEY = 'readRetardIds';

  private loadReadRetardIds(): Set<number> {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      return raw ? new Set<number>(JSON.parse(raw)) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  }

  private saveReadRetardIds(ids: Set<number>): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify([...ids]));
    } catch { /* sessionStorage indisponible — on ignore */ }
  }

  private readRetardIds = signal<Set<number>>(this.loadReadRetardIds());

  constructor() {
    this.chargerEvents();
  }

  private chargerEvents(): void {
    this.eventService.getAll().subscribe(data => this.events.set(data));
  }

  private reloadLoansAndEvents(): void {
    // Recharge loans + events après une action gestionnaire (retour rendu, prolongation validée)
    this.loanService.getAll().subscribe();
    this.chargerEvents();
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

  earlyReturnCount(): number {
    return this.allAlerts().filter(a => a.type === 'EARLY_RETURN').length;
  }

  extensionCount(): number {
    return this.allAlerts().filter(a => a.type === 'EXTENSION').length;
  }

  setTab(tab: 'TOUTES' | AlertType): void {
    this.activeTab.set(tab);
  }

  markAsRead(alert: Alert): void {
    if (alert.type === 'RETARD') {
      this.readRetardIds.update(s => {
        const next = new Set([...s, alert.loanId]);
        this.saveReadRetardIds(next);
        return next;
      });
      return;
    }
    this.eventService.markAsRead(alert.id).subscribe(() => {
      this.events.update(events =>
        events.map(e => e.id === alert.id ? { ...e, readingDate: new Date().toISOString() } : e)
      );
    });
  }

  /**
   * Gestionnaire valide un retour anticipé : marque le matériel comme rendu (VALID → TERMINE).
   * L'event est ensuite marqué comme lu. Le loan disparaît de la liste "En cours" côté user.
   */
  validerRetour(alert: Alert): void {
    this.processingIds.update(s => new Set([...s, alert.id]));
    this.loanService.return(alert.loanId).subscribe({
      next: () => {
        this.markAsRead(alert);
        this.processingIds.update(s => { const n = new Set(s); n.delete(alert.id); return n; });
        // Retire le loan des retards front-only si présent
        this.readRetardIds.update(s => { const n = new Set(s); n.delete(alert.loanId); return n; });
      },
      error: () => {
        this.processingIds.update(s => { const n = new Set(s); n.delete(alert.id); return n; });
      }
    });
  }

  /**
   * Gestionnaire valide une prolongation : appelle extendLoan avec la date extraite de la description.
   * Format description attendu : "YYYY-MM-DD" ou "YYYY-MM-DD|motif".
   * L'event est marqué comme lu, la date de fin du loan est mise à jour.
   */
  validerExtension(alert: Alert): void {
    // La date est la première partie de la description avant le "|"
    const newEndDate = alert.description.split('|')[0].trim();
    if (!newEndDate || !/^\d{4}-\d{2}-\d{2}$/.test(newEndDate)) return;

    this.processingIds.update(s => new Set([...s, alert.id]));
    this.loanService.extendLoan(alert.loanId, newEndDate).subscribe({
      next: () => {
        this.markAsRead(alert);
        this.processingIds.update(s => { const n = new Set(s); n.delete(alert.id); return n; });
      },
      error: () => {
        this.processingIds.update(s => { const n = new Set(s); n.delete(alert.id); return n; });
      }
    });
  }

  isProcessing(alertId: number): boolean {
    return this.processingIds().has(alertId);
  }

  // Returns the display label for an alert type
  getAlertLabel(type: AlertType): string {
    const labels: Record<AlertType, string> = {
      RETARD:       'Retard',
      BREAKDOWN:    'Incident',
      EARLY_RETURN: 'Retour anticipé',
      EXTENSION:    'Prolongation',
    };
    return labels[type] ?? type;
  }

  // Extrait le motif de la description (partie après le "|")
  getMotif(description: string): string {
    const parts = description.split('|');
    return parts.length > 1 ? parts.slice(1).join('|').trim() : description;
  }

  // Extrait la date demandée de la description pour EARLY_RETURN / EXTENSION
  getDateFromDescription(description: string): string {
    const date = description.split('|')[0].trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return description;
  }

  markAllAsRead(): void {
    const unread = this.allAlerts().filter(a => !a.read);
    if (unread.length === 0) return;

    const retardIds = unread.filter(a => a.type === 'RETARD').map(a => a.loanId);
    if (retardIds.length > 0) {
      this.readRetardIds.update(s => {
        const next = new Set([...s, ...retardIds]);
        this.saveReadRetardIds(next);
        return next;
      });
    }

    const unreadEvents = unread.filter(a => a.type !== 'RETARD');
    unreadEvents.forEach(a => {
      this.eventService.markAsRead(a.id).subscribe(() => {
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
