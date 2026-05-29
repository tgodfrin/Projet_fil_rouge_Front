import { Component, signal, computed, inject } from '@angular/core';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan.model';

// ── Types d'affichage ─────────────────────────────────────────────────────────
// Emprunt individuel (groupId null)
interface SingleLoanItem {
  kind: 'single';
  loan: Loan;
}

// Groupe d'emprunts partageant le même groupId
interface GroupLoanItem {
  kind: 'group';
  groupId: string;
  loans: Loan[];
  equipmentNames: string[];
  beginDate: string;
  endDate: string;
  statusType: string;   // statut représentatif du groupe (pire statut)
}

type LoanItem = SingleLoanItem | GroupLoanItem;

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {
  private loanService  = inject(LoanService);
  private eventService = inject(EventService);
  private authService  = inject(AuthService);
  private fb           = inject(FormBuilder);

  private currentUserId = this.authService.currentUser()!.id;

  // true tant que la requête HTTP n'a pas répondu
  loading = signal(true);

  // Tous les emprunts de l'utilisateur courant
  private allLoans = toSignal(
    this.loanService.getByUser(this.currentUserId).pipe(
      tap({ next: () => this.loading.set(false), error: () => this.loading.set(false) })
    ),
    { initialValue: [] as Loan[] }
  );

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  activeTab = signal<'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE'>('EN_COURS');

  setTab(tab: 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE') {
    this.activeTab.set(tab);
    this.closeForm();
    this.openGroupId.set(null);
  }

  // Compte les emprunts bruts (pas les groupes) pour l'affichage des chips
  countByTab(tab: string): number {
    const loans = this.allLoans();
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID').length;
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS').length;
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID').length;
  }

  // ── Emprunts filtrés par onglet ───────────────────────────────────────────────
  private filteredLoans = computed(() => {
    const tab   = this.activeTab();
    const loans = this.allLoans();
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID');
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS');
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID');
  });

  // ── Items d'affichage : individuels + groupes ─────────────────────────────────
  // Les emprunts avec un groupId sont fusionnés en une seule carte de groupe.
  // Les emprunts sans groupId restent des cartes individuelles.
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

  // ── Formulaires inline ────────────────────────────────────────────────────────
  selectedLoanId = signal<number | null>(null);
  activeForm     = signal<'prolong' | 'return' | null>(null);

  returnForm = this.fb.group({
    date:  ['', Validators.required],
    motif: ['']
  });

  prolongForm = this.fb.group({
    date:  ['', Validators.required],
    motif: ['', Validators.required]
  });

  toggleForm(loanId: number, form: 'prolong' | 'return') {
    if (this.selectedLoanId() === loanId && this.activeForm() === form) {
      this.closeForm();
    } else {
      this.selectedLoanId.set(loanId);
      this.activeForm.set(form);
      this.returnForm.reset();
      this.prolongForm.reset();
    }
  }

  closeForm() {
    this.selectedLoanId.set(null);
    this.activeForm.set(null);
    this.returnForm.reset();
    this.prolongForm.reset();
  }

  submitReturn(loan: Loan) {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }
    const { date, motif } = this.returnForm.value;
    const description = motif
      ? `Retour prévu le ${date} — ${motif}`
      : `Retour prévu le ${date}`;
    this.eventService.create({
      type:        'EARLY_RETURN',
      description,
      loan:        { id: loan.id }
    }).subscribe(() => this.closeForm());
  }

  submitProlong(loan: Loan) {
    if (this.prolongForm.invalid) {
      this.prolongForm.markAllAsTouched();
      return;
    }
    const { date, motif } = this.prolongForm.value;
    const description = `Nouvelle date souhaitée : ${date} — ${motif}`;
    this.eventService.create({
      type:        'EXTENSION',
      description,
      loan:        { id: loan.id }
    }).subscribe(() => this.closeForm());
  }
}
