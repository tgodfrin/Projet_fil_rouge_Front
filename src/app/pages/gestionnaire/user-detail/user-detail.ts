import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '../../../core/services/user.service';
import { LoanService } from '../../../core/services/loan.service';
import { AppUser } from '../../../core/models/user.model';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';
import { ProfilType } from '../../../core/models/profil.model';

// RETARD n'est pas un statut en base — calculé côté front : IN_PROGRESS + endDate < now
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
  private location    = inject(Location);
  private userService = inject(UserService);
  private loanService = inject(LoanService);

  private userId = Number(this.route.snapshot.paramMap.get('id'));

  // Sans initialValue → Signal<AppUser | undefined> (undefined pendant le chargement)
  user  = toSignal(this.userService.getById(this.userId));
  loans = toSignal(this.loanService.getByUser(this.userId), { initialValue: [] as Loan[] });

  ongletActif = signal<'infos' | 'emprunts' | 'statistiques'>('infos');

  loanStats = computed(() => {
    const l   = this.loans();
    const now = new Date();
    return {
      total:     l.length,
      enCours:   l.filter(x => x.statusType === 'IN_PROGRESS').length,
      enAttente: l.filter(x => x.statusType === 'VALID').length,
      termine:   l.filter(x => x.statusType === 'TERMINE').length,
      enRetard:  l.filter(x => x.statusType === 'IN_PROGRESS' && new Date(x.endDate) < now).length,
    };
  });

  retour(): void {
    this.location.back();
  }

  changerOnglet(onglet: 'infos' | 'emprunts' | 'statistiques'): void {
    this.ongletActif.set(onglet);
  }

  getInitials(user: AppUser): string {
    return user.name[0] + user.lastname[0];
  }

  /** RETARD = IN_PROGRESS dont endDate est dépassée */
  getDisplayStatus(loan: Loan): LoanDisplayStatus {
    if (loan.statusType === 'IN_PROGRESS' && new Date(loan.endDate) < new Date()) {
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
      VALID:       'En attente',
      IN_PROGRESS: 'En cours',
      TERMINE:     'Terminé',
      RETARD:      'En retard',
      INVALID:     'Refusé',
    };
    return labels[status];
  }

  getLoanStatusClass(status: LoanDisplayStatus): string {
    const classes: Record<LoanDisplayStatus, string> = {
      VALID:       'b-warning',
      IN_PROGRESS: 'b-info',
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
