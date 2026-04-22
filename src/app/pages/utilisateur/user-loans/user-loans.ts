import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserLoan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {
  private fb = inject(FormBuilder);

  // ── Données mock ───────────────────────────────────────
  private loans: UserLoan[] = [
    {
      id: 1,
      equipmentName: 'MacBook Pro 14"',
      categoryIcon: '💻',
      startDate: '2026-04-01',
      endDate: '2026-04-20',
      status: 'VALID'
    },
    {
      id: 2,
      equipmentName: 'Appareil photo Sony A7',
      categoryIcon: '📷',
      startDate: '2026-04-10',
      endDate: '2026-04-18',
      status: 'RETARD'
    },
    {
      id: 3,
      equipmentName: 'Vidéoprojecteur Epson',
      categoryIcon: '📽️',
      startDate: '2026-04-20',
      endDate: '2026-04-25',
      status: 'IN_PROGRESS'
    },
    {
      id: 4,
      equipmentName: 'iPad Pro 12.9"',
      categoryIcon: '📱',
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      status: 'TERMINE'
    }
  ];

  // ── Tabs ───────────────────────────────────────────────
  activeTab = signal<'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE'>('EN_COURS');

  setTab(tab: 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE') {
    this.activeTab.set(tab);
    this.closeForm();
  }

  countByTab(tab: string): number {
    if (tab === 'EN_COURS') {
      return this.loans.filter(l => l.status === 'VALID' || l.status === 'RETARD').length;
    }
    if (tab === 'EN_ATTENTE') {
      return this.loans.filter(l => l.status === 'IN_PROGRESS').length;
    }
    return this.loans.filter(l => l.status === 'TERMINE' || l.status === 'INVALID').length;
  }

  filteredLoans = computed(() => {
    const tab = this.activeTab();
    if (tab === 'EN_COURS') {
      return this.loans.filter(l => l.status === 'VALID' || l.status === 'RETARD');
    }
    if (tab === 'EN_ATTENTE') {
      return this.loans.filter(l => l.status === 'IN_PROGRESS');
    }
    return this.loans.filter(l => l.status === 'TERMINE' || l.status === 'INVALID');
  });

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

  // ── Dates & progress ───────────────────────────────────
  formatDateRange(start: string, end: string): string {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt(start)} → ${fmt(end)}`;
  }

  getProgressPercent(loan: UserLoan): number {
    const start = new Date(loan.startDate).getTime();
    const end   = new Date(loan.endDate).getTime();
    const now   = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getDaysLeft(loan: UserLoan): number {
    const end = new Date(loan.endDate).getTime();
    const diff = end - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // ── Formulaires inline ─────────────────────────────────
  selectedLoanId = signal<number | null>(null);
  activeForm     = signal<'prolong' | 'return' | null>(null);

  returnForm = this.fb.group({
    date:   ['', Validators.required],
    motif:  ['']
  });

  prolongForm = this.fb.group({
    date:   ['', Validators.required],
    motif:  ['', Validators.required]
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

  submitReturn(loan: UserLoan) {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }
    console.log('Retour anticipé', { id: loan.id, ...this.returnForm.value });
    // TODO: appel API
    this.closeForm();
  }

  submitProlong(loan: UserLoan) {
    if (this.prolongForm.invalid) {
      this.prolongForm.markAllAsTouched();
      return;
    }
    console.log('Prolongation', { id: loan.id, ...this.prolongForm.value });
    // TODO: appel API
    this.closeForm();
  }
}