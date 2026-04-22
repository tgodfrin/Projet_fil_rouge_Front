import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExportComponent } from '../../../shared/export/export';
import { LoanStatus, Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan',
  standalone: true,
  imports: [CommonModule, ExportComponent],
  templateUrl: './loan.html',
  styleUrl: './loan.scss'
})
export class LoanComponent {

  constructor(private router: Router) {}

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
    status: 'IN_PROGRESS'
  },
  {
    id: 2,
    equipmentName: 'Meta Quest 3',
    borrowerName: 'Kevin Leclerc',
    borrowerInitials: 'KL',
    startDate: '2026-04-12',
    endDate: '2026-04-15',
    status: 'IN_PROGRESS',
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
    status: 'VALID'
  },
  {
    id: 5,
    equipmentName: 'HP EliteBook 840',
    borrowerName: 'Tom Vasseur',
    borrowerInitials: 'TV',
    startDate: '2026-04-14',
    endDate: '2026-04-22',
    status: 'VALID'
  }
]);

  pendingLoans = computed(() =>
    this.loans().filter(l => l.status === 'IN_PROGRESS')
  );

  activeLoans = computed(() => {
    let list = this.loans().filter(l =>
      l.status === 'VALID' || l.status === 'RETARD'
    );

    // Filtre statut
    const statut = this.filtreStatut();
    if (statut === 'VALID') list = list.filter(l => l.status === 'VALID');
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
      list.map(l => l.id === loan.id ? { ...l, status: 'VALID' as LoanStatus } : l)
    );
  }

  refuseLoan(loan: Loan): void {
    this.loans.update(list =>
      list.map(l => l.id === loan.id ? { ...l, status: 'INVALID' as LoanStatus } : l)
    );
  }

  returnLoan(loan: Loan): void {
    this.loans.update(list =>
      list.map(l => l.id === loan.id ? { ...l, status: 'TERMINE' as LoanStatus } : l)
    );
  }

  loansExport = computed(() =>
    this.loans().map(l => ({
      id: l.id,
      equipement: l.equipmentName,
      emprunteur: l.borrowerName,
      debut: l.startDate,
      fin: l.endDate,
      statut: this.getStatusLabel(l.status),
      commentaire: l.comment ?? ''
    }))
  );

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
      IN_PROGRESS: 'En attente',
      VALID: 'Actif',
      RETARD: 'Retard',
      TERMINE: 'Terminé',
      INVALID: 'Refusé'
    };
    return labels[status];
  }

  getStatusClass(status: LoanStatus): string {
    const classes: Record<LoanStatus, string> = {
      IN_PROGRESS: 'badge-warning',
      VALID: 'badge-success',
      RETARD: 'badge-danger',
      TERMINE: 'badge-neutral',
      INVALID: 'badge-danger'
    };
    return classes[status];
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/emprunts', id]);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}