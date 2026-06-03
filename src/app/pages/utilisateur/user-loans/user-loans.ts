import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan.model';
import { Event } from '../../../core/models/event.model';

// ── Types d'affichage ─────────────────────────────────────────────────────────
interface SingleLoanItem {
  kind: 'single';
  loan: Loan;
}

interface GroupLoanItem {
  kind: 'group';
  groupId: string;
  loans: Loan[];
  equipmentNames: string[];
  beginDate: string;
  endDate: string;
  statusType: string;
}

// Card d'une demande de retour anticipé ou prolongation
interface RequestEventItem {
  kind: 'event';
  event: Event;
  loan: Loan | undefined;
  // PENDING = gestionnaire n'a pas encore traité
  // VALIDATED = gestionnaire a validé (date du loan correspond à la date demandée)
  // REFUSED = gestionnaire a refusé (date inchangée)
  status: 'PENDING' | 'VALIDATED' | 'REFUSED';
  requestedDate: string; // YYYY-MM-DD extrait de la description
  motif: string | null;
}

type LoanItem = SingleLoanItem | GroupLoanItem;

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {
  private loanService  = inject(LoanService);
  private eventService = inject(EventService);
  private authService  = inject(AuthService);

  private currentUserId = this.authService.currentUser()!.id;

  loading = signal(true);
  private allLoans  = signal<Loan[]>([]);
  private allEvents = signal<Event[]>([]);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    let loansLoaded  = false;
    let eventsLoaded = false;

    const checkDone = () => {
      if (loansLoaded && eventsLoaded) this.loading.set(false);
    };

    this.loanService.getByUser(this.currentUserId).subscribe({
      next:  (loans) => { this.allLoans.set(loans); loansLoaded = true; checkDone(); },
      error: ()      => { loansLoaded = true; checkDone(); }
    });

    this.eventService.getMyEvents().subscribe({
      next:  (events) => { this.allEvents.set(events); eventsLoaded = true; checkDone(); },
      error: ()       => { eventsLoaded = true; checkDone(); }
    });
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  activeTab = signal<'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE'>('EN_COURS');

  setTab(tab: 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE') {
    this.activeTab.set(tab);
    this.openGroupId.set(null);
  }

  countByTab(tab: string): number {
    const loans = this.allLoans();
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID').length;
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS').length
                                   + this.pendingEvents().length;
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID').length
         + this.processedEvents().length;
  }

  // ── Events helpers ────────────────────────────────────────────────────────────
  // Extrait la date ISO (YYYY-MM-DD) du début de la description
  private parseDate(description: string): string {
    const part = description.split('|')[0].trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : '';
  }

  private parseMotif(description: string): string | null {
    const parts = description.split('|');
    return parts.length > 1 ? parts.slice(1).join('|').trim() : null;
  }

  // Détermine si l'event a été validé ou refusé en comparant la date demandée avec la endDate du loan
  private resolveEventStatus(event: Event): 'PENDING' | 'VALIDATED' | 'REFUSED' {
    if (!event.readingDate) return 'PENDING';
    const requestedDate = this.parseDate(event.description ?? '');
    if (!requestedDate) return 'REFUSED'; // description non parsable = on ne peut pas vérifier
    const loan = this.allLoans().find(l => l.id === event.loan.id);
    if (!loan) return 'REFUSED';
    // Si la endDate du loan correspond à la date demandée → gestionnaire a validé
    return loan.endDate.startsWith(requestedDate) ? 'VALIDATED' : 'REFUSED';
  }

  private buildEventItem(event: Event): RequestEventItem {
    return {
      kind:          'event',
      event,
      loan:          this.allLoans().find(l => l.id === event.loan.id),
      status:        this.resolveEventStatus(event),
      requestedDate: this.parseDate(event.description ?? ''),
      motif:         this.parseMotif(event.description ?? ''),
    };
  }

  // Events en attente (gestionnaire n'a pas encore lu)
  pendingEvents = computed((): RequestEventItem[] =>
    this.allEvents()
      .filter(e => !e.readingDate)
      .map(e => this.buildEventItem(e))
  );

  // Events traités (gestionnaire a lu = traité)
  processedEvents = computed((): RequestEventItem[] =>
    this.allEvents()
      .filter(e => !!e.readingDate)
      .map(e => this.buildEventItem(e))
  );

  // ── Emprunts filtrés ──────────────────────────────────────────────────────────
  private filteredLoans = computed(() => {
    const tab   = this.activeTab();
    const loans = this.allLoans();
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID');
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS');
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID');
  });

  // ── Items d'affichage ─────────────────────────────────────────────────────────
  displayItems = computed((): LoanItem[] => {
    const loans = this.filteredLoans();
    const items: LoanItem[] = [];
    const groupMap = new Map<string, Loan[]>();

    loans.forEach(loan => {
      if (!loan.groupId) {
        items.push({ kind: 'single', loan });
      } else {
        const existing = groupMap.get(loan.groupId) ?? [];
        groupMap.set(loan.groupId, [...existing, loan]);
      }
    });

    groupMap.forEach((groupLoans, groupId) => {
      items.push({
        kind:           'group',
        groupId,
        loans:          groupLoans,
        equipmentNames: groupLoans.map(l => l.equipment.equipmentName),
        beginDate:      groupLoans[0].beginDate,
        endDate:        groupLoans[0].endDate,
        statusType:     groupLoans[0].statusType,
      });
    });

    return items;
  });

  // ── Groupe dépliable ──────────────────────────────────────────────────────────
  openGroupId = signal<string | null>(null);

  toggleGroupDetail(groupId: string): void {
    this.openGroupId.update(v => v === groupId ? null : groupId);
  }

  // ── Statut affiché (RETARD calculé côté front) ────────────────────────────────
  getDisplayStatus(loan: Loan): string {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  // ── Badges loans ──────────────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      VALID:       'badge-success',
      RETARD:      'badge-danger',
      IN_PROGRESS: 'badge-warning',
      TERMINE:     'badge-neutral',
      INVALID:     'badge-danger'
    };
    return map[status] ?? 'badge-neutral';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      VALID:       'En cours',
      RETARD:      'En retard',
      IN_PROGRESS: 'En attente',
      TERMINE:     'Terminé',
      INVALID:     'Refusé'
    };
    return map[status] ?? status;
  }

  // ── Badges events ─────────────────────────────────────────────────────────────
  getEventStatusClass(status: 'PENDING' | 'VALIDATED' | 'REFUSED'): string {
    const map = { PENDING: 'badge-warning', VALIDATED: 'badge-success', REFUSED: 'badge-danger' };
    return map[status];
  }

  getEventStatusLabel(status: 'PENDING' | 'VALIDATED' | 'REFUSED'): string {
    const map = { PENDING: 'En attente', VALIDATED: 'Validé', REFUSED: 'Refusé' };
    return map[status];
  }

  getEventTypeLabel(type: string): string {
    return type === 'EARLY_RETURN' ? 'Retour anticipé' : 'Prolongation';
  }

  getEventTypeIcon(type: string): string {
    return type === 'EARLY_RETURN' ? '↩️' : '📅';
  }

  getCategoryIcon(_loan: Loan): string {
    return '📦';
  }

  // ── Dates & progress ──────────────────────────────────────────────────────────
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateRange(start: string, end: string): string {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt(start)} → ${fmt(end)}`;
  }

  getProgressPercent(loan: Loan): number {
    const start = new Date(loan.beginDate).getTime();
    const end   = new Date(loan.endDate).getTime();
    const now   = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getDaysLeft(loan: Loan): number {
    const end  = new Date(loan.endDate).getTime();
    const diff = end - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
