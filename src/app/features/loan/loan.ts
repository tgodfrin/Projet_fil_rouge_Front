import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoanStatus = 'EN_ATTENTE' | 'EN_COURS' | 'RETARD' | 'TERMINE' | 'REFUSE';

export interface Loan {
  id: number;
  equipmentName: string;
  borrowerName: string;
  borrowerInitials: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  comment?: string;
}

@Component({
  selector: 'app-loan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan.html',
  styleUrl: './loan.scss'
})
export class LoanComponent {

  loans = signal<Loan[]>([
    {
      id: 1,
      equipmentName: 'iPad Pro 12.9"',
      borrowerName: 'Julie Fontaine',
      borrowerInitials: 'JF',
      startDate: '2026-03-03',
      endDate: '2026-03-10',
      status: 'EN_ATTENTE'
    },
    {
      id: 2,
      equipmentName: 'Meta Quest 3',
      borrowerName: 'Kevin Leclerc',
      borrowerInitials: 'KL',
      startDate: '2026-03-05',
      endDate: '2026-03-08',
      status: 'EN_ATTENTE',
      comment: 'Pour le cours de UX immersif'
    },
    {
      id: 3,
      equipmentName: 'MacBook Pro M3',
      borrowerName: 'Marc Durand',
      borrowerInitials: 'MD',
      startDate: '2026-02-24',
      endDate: '2026-03-01',
      status: 'RETARD'
    },
    {
      id: 4,
      equipmentName: 'iPad Pro 12.9"',
      borrowerName: 'Sophie Renard',
      borrowerInitials: 'SR',
      startDate: '2026-03-04',
      endDate: '2026-03-10',
      status: 'EN_COURS'
    },
    {
      id: 5,
      equipmentName: 'HP EliteBook 840',
      borrowerName: 'Tom Vasseur',
      borrowerInitials: 'TV',
      startDate: '2026-03-07',
      endDate: '2026-03-15',
      status: 'EN_COURS'
    }
  ]);

  // Emprunts à valider (cartes en haut)
  pendingLoans = computed(() =>
    this.loans().filter(l => l.status === 'EN_ATTENTE')
  );

  // Emprunts en cours + retard (tableau en bas)
  activeLoans = computed(() =>
    this.loans().filter(l => l.status === 'EN_COURS' || l.status === 'RETARD')
  );

  validateLoan(loan: Loan): void {
    this.loans.update(list =>
      list.map(l => l.id === loan.id ? { ...l, status: 'EN_COURS' as LoanStatus } : l)
    );
  }

  refuseLoan(loan: Loan): void {
    this.loans.update(list =>
      list.map(l => l.id === loan.id ? { ...l, status: 'REFUSE' as LoanStatus } : l)
    );
  }

  getStatusLabel(status: LoanStatus): string {
    const labels: Record<LoanStatus, string> = {
      EN_ATTENTE: 'En attente',
      EN_COURS: 'Actif',
      RETARD: 'Retard',
      TERMINE: 'Terminé',
      REFUSE: 'Refusé'
    };
    return labels[status];
  }

  getStatusClass(status: LoanStatus): string {
    const classes: Record<LoanStatus, string> = {
      EN_ATTENTE: 'badge-warning',
      EN_COURS: 'badge-success',
      RETARD: 'badge-danger',
      TERMINE: 'badge-neutral',
      REFUSE: 'badge-danger'
    };
    return classes[status];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}