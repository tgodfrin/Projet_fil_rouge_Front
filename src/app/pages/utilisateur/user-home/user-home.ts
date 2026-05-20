import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoanService } from '../../../core/services/loan.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-home.html',
  styleUrl: './user-home.scss'
})
export class UserHomeComponent {
  private loanService = inject(LoanService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  private currentUserId = this.authService.currentUser()!.id;

  // Données utilisateur chargées directement — indépendant des emprunts
  private userSig = toSignal(this.userService.getById(this.currentUserId));

  // Tous les emprunts de l'utilisateur courant
  private allLoans = toSignal(
    this.loanService.getByUser(this.currentUserId),
    { initialValue: [] as Loan[] }
  );

  // Données affichées dans le header — toujours disponibles même sans emprunt
  user = computed(() => {
    const u = this.userSig();
    if (!u) return { firstName: '—', lastName: '', initials: '?' };
    return {
      firstName: u.name,
      lastName:  u.lastname,
      initials:  `${u.name[0]}${u.lastname[0]}`.toUpperCase()
    };
  });

  // Emprunts actifs : VALID = validé par le gestionnaire (RETARD inclus, calculé côté front)
  activeLoans = computed(() =>
    this.allLoans().filter(l => l.statusType === 'VALID')
  );

  // Nombre d'emprunts en attente de validation gestionnaire
  pendingCount = computed(() =>
    this.allLoans().filter(l => l.statusType === 'IN_PROGRESS').length
  );

  // Emprunt dont le retour est prévu demain ou déjà en retard
  returnSoonLoan = computed(() =>
    this.activeLoans().find(l => this.getDaysLeft(l) <= 1) ?? null
  );

  isRetard(loan: Loan): boolean {
    return loan.statusType === 'VALID' && new Date(loan.endDate) < new Date();
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
