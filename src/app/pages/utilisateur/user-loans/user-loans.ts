import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan.model';

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

type LoanItem = SingleLoanItem | GroupLoanItem;

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {
  private loanService = inject(LoanService);
  private authService = inject(AuthService);

  private currentUserId = this.authService.currentUser()!.id;

  loading = signal(true);
  private allLoans = signal<Loan[]>([]);

  constructor() {
    this.loadLoans();
  }

  private loadLoans(): void {
    this.loading.set(true);
    this.loanService.getByUser(this.currentUserId).subscribe({
      next:  (loans) => { this.allLoans.set(loans); this.loading.set(false); },
      error: ()      => this.loading.set(false)
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
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS').length;
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID').length;
  }

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

  // ── Badges ────────────────────────────────────────────────────────────────────
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

  getCategoryIcon(_loan: Loan): string {
    return '📦';
  }

  // ── Dates & progress ──────────────────────────────────────────────────────────
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
