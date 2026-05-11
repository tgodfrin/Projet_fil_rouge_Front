import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoanService } from '../../../core/services/loan.service';
import { Loan } from '../../../core/models/loan.model';

// userId de l'utilisateur connecté — à remplacer par un vrai service d'auth
const CURRENT_USER_ID = 1;

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-home.html',
  styleUrl: './user-home.scss'
})
export class UserHomeComponent {
  private loanService = inject(LoanService);

  // Tous les emprunts de l'utilisateur courant
  private allLoans = toSignal(
    this.loanService.getByUser(CURRENT_USER_ID),
    { initialValue: [] as Loan[] }
  );

  // Nom de l'utilisateur déduit du requester du premier emprunt
  user = computed(() => {
    const requester = this.allLoans()[0]?.requester;
    if (requester) {
      return {
        firstName: requester.name,
        lastName:  requester.lastname,
        initials:  `${requester.name[0]}${requester.lastname[0]}`
      };
    }
    return { firstName: '—', lastName: '', initials: '?' };
  });

  // Emprunts actifs : statusType IN_PROGRESS (RETARD inclus, calculé côté front)
  activeLoans = computed(() =>
    this.allLoans().filter(l => l.statusType === 'IN_PROGRESS')
  );

  // Nombre d'emprunts en attente de validation
  pendingCount = computed(() =>
    this.allLoans().filter(l => l.statusType === 'VALID').length
  );

  // Emprunt dont le retour est prévu demain ou déjà en retard
  returnSoonLoan = computed(() =>
    this.activeLoans().find(l => this.getDaysLeft(l) <= 1) ?? null
  );

  isRetard(loan: Loan): boolean {
    return loan.statusType === 'IN_PROGRESS' && new Date(loan.endDate) < new Date();
  }

  getDaysLeft(loan: Loan): number {
    const end = new Date(loan.endDate).getTime();
    return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
  }

  getProgressPercent(loan: Loan): number {
    const start = new Date(loan.beginDate).getTime();
    const end   = new Date(loan.endDate).getTime();
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100)));
  }

  formatDateRange(startDate: string, endDate: string): string {
    const s = new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const e = new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} au ${e}`;
  }
}
