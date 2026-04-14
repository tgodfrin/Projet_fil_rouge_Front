import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './loan.html',
  styleUrl: './loan.scss'
})
export class LoanComponent {

  filtreStatut = signal<string>('tous');
  filtreTemps = signal<string>('tout');

  loans = signal<Loan[]>([
  {
    id: 1,
    equipmentName: 'iPad Pro 12.9"',
    borrowerName: 'Julie Fontaine',
    borrowerInitials: 'JF',
    startDate: '2026-04-10',
    endDate: '2026-04-17',
    status: 'EN_ATTENTE'
  },
  {
    id: 2,
    equipmentName: 'Meta Quest 3',
    borrowerName: 'Kevin Leclerc',
    borrowerInitials: 'KL',
    startDate: '2026-04-12',
    endDate: '2026-04-15',
    status: 'EN_ATTENTE',
    comment: 'Pour le cours de UX immersif'
  },
  {
    id: 3,
    equipmentName: 'MacBook Pro M3',
    borrowerName: 'Marc Durand',
    borrowerInitials: 'MD',
    startDate: '2026-04-07',
    endDate: '2026-04-11',
    status: 'RETARD'
  },
  {
    id: 4,
    equipmentName: 'iPad Pro 12.9"',
    borrowerName: 'Sophie Renard',
    borrowerInitials: 'SR',
    startDate: '2026-04-08',
    endDate: '2026-04-14',
    status: 'EN_COURS'
  },
  {
    id: 5,
    equipmentName: 'HP EliteBook 840',
    borrowerName: 'Tom Vasseur',
    borrowerInitials: 'TV',
    startDate: '2026-04-14',
    endDate: '2026-04-22',
    status: 'EN_COURS'
  }
]);

  pendingLoans = computed(() =>
    this.loans().filter(l => l.status === 'EN_ATTENTE')
  );

  activeLoans = computed(() => {
    let list = this.loans().filter(l =>
      l.status === 'EN_COURS' || l.status === 'RETARD'
    );

    // Filtre statut
    const statut = this.filtreStatut();
    if (statut === 'EN_COURS') list = list.filter(l => l.status === 'EN_COURS');
    if (statut === 'RETARD') list = list.filter(l => l.status === 'RETARD');

    // Filtre temporalité
    const now = new Date();
    const temps = this.filtreTemps();
    if (temps === 'semaine') {
      const debutSemaine = new Date(now);
      debutSemaine.setDate(now.getDate() - now.getDay() + 1);
      const finSemaine = new Date(debutSemaine);
      finSemaine.setDate(debutSemaine.getDate() + 6);
      list = list.filter(l => {
        const d = new Date(l.startDate);
        return d >= debutSemaine && d <= finSemaine;
      });
    }
    if (temps === 'mois') {
      list = list.filter(l => {
        const d = new Date(l.startDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    return list;
  });

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

  returnLoan(loan: Loan): void {
    this.loans.update(list =>
      list.map(l => l.id === loan.id ? { ...l, status: 'TERMINE' as LoanStatus } : l)
    );
  }

  onFiltreStatutChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtreStatut.set(value);
  }

  onFiltreTempsChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtreTemps.set(value);
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