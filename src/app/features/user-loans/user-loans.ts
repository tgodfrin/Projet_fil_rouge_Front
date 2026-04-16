import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Loan {
  id: number;
  equipmentName: string;
  categoryIcon: string;
  startDate: string;
  endDate: string;
  status: 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE' | 'RETARD' | 'TERMINE' | 'REFUSE';
}

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {

  // ── Données mock ───────────────────────────────────────
  private loans: Loan[] = [
    {
      id: 1,
      equipmentName: 'MacBook Pro 14"',
      categoryIcon: '💻',
      startDate: '2026-04-01',
      endDate: '2026-04-20',
      status: 'EN_COURS'
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
      status: 'EN_ATTENTE'
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
      return this.loans.filter(l => l.status === 'EN_COURS' || l.status === 'RETARD').length;
    }
    if (tab === 'EN_ATTENTE') {
      return this.loans.filter(l => l.status === 'EN_ATTENTE').length;
    }
    return this.loans.filter(l => l.status === 'TERMINE' || l.status === 'REFUSE').length;
  }

  filteredLoans = computed(() => {
    const tab = this.activeTab();
    if (tab === 'EN_COURS') {
      return this.loans.filter(l => l.status === 'EN_COURS' || l.status === 'RETARD');
    }
    if (tab === 'EN_ATTENTE') {
      return this.loans.filter(l => l.status === 'EN_ATTENTE');
    }
    return this.loans.filter(l => l.status === 'TERMINE' || l.status === 'REFUSE');
  });

  // ── Badges ─────────────────────────────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      EN_COURS:   'badge-success',
      RETARD:     'badge-danger',
      EN_ATTENTE: 'badge-warning',
      TERMINE:    'badge-neutral',
      REFUSE:     'badge-danger'
    };
    return map[status] ?? 'badge-neutral';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      EN_COURS:   'En cours',
      RETARD:     'En retard',
      EN_ATTENTE: 'En attente',
      TERMINE:    'Terminé',
      REFUSE:     'Refusé'
    };
    return map[status] ?? status;
  }

  // ── Dates & progress ───────────────────────────────────
  formatDateRange(start: string, end: string): string {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt(start)} → ${fmt(end)}`;
  }

  getProgressPercent(loan: Loan): number {
    const start = new Date(loan.startDate).getTime();
    const end   = new Date(loan.endDate).getTime();
    const now   = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getDaysLeft(loan: Loan): number {
    const end = new Date(loan.endDate).getTime();
    const diff = end - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // ── Formulaires inline ─────────────────────────────────
  selectedLoanId = signal<number | null>(null);
  activeForm = signal<'prolong' | 'return' | null>(null);

  returnDate = '';
  returnReason = '';
  prolongDate = '';
  prolongReason = '';

  toggleForm(loanId: number, form: 'prolong' | 'return') {
    if (this.selectedLoanId() === loanId && this.activeForm() === form) {
      this.closeForm();
    } else {
      this.selectedLoanId.set(loanId);
      this.activeForm.set(form);
    }
  }

  closeForm() {
    this.selectedLoanId.set(null);
    this.activeForm.set(null);
    this.returnDate = '';
    this.returnReason = '';
    this.prolongDate = '';
    this.prolongReason = '';
  }

  submitReturn(loan: Loan) {
    console.log('Retour anticipé', { id: loan.id, date: this.returnDate, motif: this.returnReason });
    // TODO: appel API
    this.closeForm();
  }

  submitProlong(loan: Loan) {
    console.log('Prolongation', { id: loan.id, date: this.prolongDate, motif: this.prolongReason });
    // TODO: appel API
    this.closeForm();
  }
}