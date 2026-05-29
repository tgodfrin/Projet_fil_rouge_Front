import { Component, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '../../../core/services/user.service';
import { LoanService } from '../../../core/services/loan.service';
import { AppUser } from '../../../core/models/user.model';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';
import { ProfilType } from '../../../core/models/profil.model';

// RETARD n'est pas un statut en base — calculé côté front : VALID + endDate < now
type LoanDisplayStatus = StatusLoanType | 'RETARD';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss'
})
export class UserDetailComponent {

  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private location    = inject(Location);
  private userService = inject(UserService);
  private loanService = inject(LoanService);

  private userId = Number(this.route.snapshot.paramMap.get('id'));

  // true tant que la requête HTTP des emprunts n'a pas répondu
  loadingLoans = signal(true);

  // Sans initialValue → Signal<AppUser | undefined> (undefined pendant le chargement)
  user  = toSignal(this.userService.getById(this.userId));
  // tap() passe à false dès que la réponse arrive (succès ou erreur)
  loans = toSignal(
    this.loanService.getByUser(this.userId).pipe(
      tap({ next: () => this.loadingLoans.set(false), error: () => this.loadingLoans.set(false) })
    ),
    { initialValue: [] as Loan[] }
  );

  ongletActif = signal<'infos' | 'emprunts' | 'statistiques'>('infos');

  loanStats = computed(() => {
    const l   = this.loans();
    const now = new Date();
    return {
      total:     l.length,
      enCours:   l.filter(x => x.statusType === 'VALID').length,
      enAttente: l.filter(x => x.statusType === 'IN_PROGRESS').length,
      termine:   l.filter(x => x.statusType === 'TERMINE').length,
      enRetard:  l.filter(x => x.statusType === 'VALID' && new Date(x.endDate) < now).length,
    };
  });

  retour(): void {
    this.location.back();
  }

  // Navigue vers la page d'édition de l'utilisateur
  edit(): void {
    this.router.navigate(['/gestionnaire/utilisateurs', this.userId, 'edit']);
  }

  // Demande confirmation puis supprime l'utilisateur via le back, puis redirige vers la liste
  delete(): void {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.userService.delete(this.userId).subscribe({
      next: () => this.router.navigate(['/gestionnaire/utilisateurs']),
      error: (err) => console.error('Erreur lors de la suppression :', err)
    });
  }

  changerOnglet(onglet: 'infos' | 'emprunts' | 'statistiques'): void {
    this.ongletActif.set(onglet);
  }

  getInitials(user: AppUser): string {
    return user.name[0] + user.lastname[0];
  }

  /** RETARD = VALID dont endDate est dépassée */
  getDisplayStatus(loan: Loan): LoanDisplayStatus {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  getRoleLabel(role: ProfilType): string {
    const labels: Record<ProfilType, string> = {
      GESTIONNAIRE:  'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT:   'Intervenant',
      STAGIAIRE:     'Stagiaire',
    };
    return labels[role];
  }

  getRoleClass(role: ProfilType): string {
    const classes: Record<ProfilType, string> = {
      GESTIONNAIRE:  'badge-info',
      COLLABORATEUR: 'badge-success',
      INTERVENANT:   'badge-warning',
      STAGIAIRE:     'badge-neutral',
    };
    return classes[role];
  }

  getLoanStatusLabel(status: LoanDisplayStatus): string {
    const labels: Record<LoanDisplayStatus, string> = {
      IN_PROGRESS: 'En attente',
      VALID:       'En cours',
      TERMINE:     'Terminé',
      RETARD:      'En retard',
      INVALID:     'Refusé',
    };
    return labels[status];
  }

  getLoanStatusClass(status: LoanDisplayStatus): string {
    const classes: Record<LoanDisplayStatus, string> = {
      IN_PROGRESS: 'b-warning',
      VALID:       'b-success',
      TERMINE:     'b-success',
      RETARD:      'b-danger',
      INVALID:     'b-neutral',
    };
    return classes[status];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
