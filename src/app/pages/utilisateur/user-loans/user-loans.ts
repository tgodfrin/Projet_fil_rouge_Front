import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan.model';
import { Event, EventStatusType } from '../../../core/models/event.model';
import { getCategoryIcon } from '../../../core/utils/category-icon';

// Types d'affichage
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
  // Statut fiable lu directement depuis decisionStatus (plus de déduction par comparaison de dates)
  status: EventStatusType;
  requestedDate: string | null; // date demandée (champ dédié côté back)
  motif: string | null;         // motif libre saisi par l'utilisateur
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

  // Tabs
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

  // Events helpers
  private buildEventItem(event: Event): RequestEventItem {
    return {
      kind:          'event',
      event,
      loan:          this.allLoans().find(l => l.id === event.loan.id),
      status:        event.decisionStatus, // statut fiable lu côté back
      requestedDate: event.requestedDate,
      motif:         event.description,
    };
  }

  // Demandes encore en attente de décision (decisionStatus PENDING)
  pendingEvents = computed((): RequestEventItem[] =>
    this.allEvents()
      .filter(e => e.decisionStatus === 'PENDING')
      .map(e => this.buildEventItem(e))
  );

  // Demandes traitées (acceptées ou refusées)
  processedEvents = computed((): RequestEventItem[] =>
    this.allEvents()
      .filter(e => e.decisionStatus !== 'PENDING')
      .map(e => this.buildEventItem(e))
  );

  // Emprunts filtrés
  private filteredLoans = computed(() => {
    const tab   = this.activeTab();
    const loans = this.allLoans();
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID');
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS');
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID');
  });

  // Items d'affichage
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

  // Groupe dépliable
  openGroupId = signal<string | null>(null);

  toggleGroupDetail(groupId: string): void {
    this.openGroupId.update(v => v === groupId ? null : groupId);
  }

  // Statut affiché (RETARD calculé côté front)
  getDisplayStatus(loan: Loan): string {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  // Badges loans
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

  // Badges events
  getEventStatusClass(status: EventStatusType): string {
    const map: Record<EventStatusType, string> = {
      PENDING:  'badge-warning',
      ACCEPTED: 'badge-success',
      REFUSED:  'badge-danger'
    };
    return map[status];
  }

  getEventStatusLabel(status: EventStatusType): string {
    const map: Record<EventStatusType, string> = {
      PENDING:  'En attente',
      ACCEPTED: 'Validé',
      REFUSED:  'Refusé'
    };
    return map[status];
  }

  getEventTypeLabel(type: string): string {
    return type === 'EARLY_RETURN' ? 'Retour anticipé' : 'Prolongation';
  }

  getEventTypeIcon(type: string): string {
    return type === 'EARLY_RETURN' ? '↩️' : '📅';
  }

  // Icône de catégorie réelle, à partir du nom de la famille de l'équipement emprunté
  getCategoryIcon(loan: Loan): string {
    return getCategoryIcon(loan.equipment.equipmentFamily.nameEquipmentFamily);
  }

  // Dates & progress
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
