import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoanService } from '../../../core/services/loan.service';
import { Loan } from '../../../core/models/loan.model';

// userId de l'utilisateur connecté — à remplacer par un vrai service d'auth
const CURRENT_USER_ID = 1;

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {
  private loanService = inject(LoanService);
  private fb          = inject(FormBuilder);

  // Tous les emprunts de l'utilisateur courant
  private allLoans = toSignal(
    this.loanService.getByUser(CURRENT_USER_ID),
    { initialValue: [] as Loan[] }
  );

  // ── Tabs ───────────────────────────────────────────────
  activeTab = signal<'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE'>('EN_COURS');

  setTab(tab: 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE') {
    this.activeTab.set(tab);
    this.closeForm();
  }

  countByTab(tab: string): number {
    const loans = this.allLoans();
    // VALID       = emprunt validé et actif (y compris RETARD côté front)
    // IN_PROGRESS = demande en attente de traitement gestionnaire
    // TERMINE/INVALID = historique
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID').length;
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS').length;
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID').length;
  }

  filteredLoans = computed(() => {
    const tab   = this.activeTab();
    const loans = this.allLoans();
    if (tab === 'EN_COURS')   return loans.filter(l => l.statusType === 'VALID');
    if (tab === 'EN_ATTENTE') return loans.filter(l => l.statusType === 'IN_PROGRESS');
    return loans.filter(l => l.statusType === 'TERMINE' || l.statusType === 'INVALID');
  });

  // ── Statut affiché (RETARD calculé côté front) ─────────
  getDisplayStatus(loan: Loan): string {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  // ── Badges ─────────────────────────────────────────────
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

  // ── Icône équipement (family id → emoji) ───────────────
  getCategoryIcon(_loan: Loan): string {
    return '📦';
  }

  // ── Dates & progress ───────────────────────────────────
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

  // ── Formulaires inline ─────────────────────────────────
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
    console.log('Retour anticipé', { id: loan.id, ...this.returnForm.value });
    // TODO: appel API loanService.return(loan.id)
    this.closeForm();
  }

  submitProlong(loan: Loan) {
    if (this.prolongForm.invalid) {
      this.prolongForm.markAllAsTouched();
      return;
    }
    console.log('Prolongation', { id: loan.id, ...this.prolongForm.value });
    // TODO: appel API
    this.closeForm();
  }
}
