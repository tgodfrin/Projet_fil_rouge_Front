import { Component, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '../../../core/services/user.service';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';
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

  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private location     = inject(Location);
  private userService  = inject(UserService);
  private loanService  = inject(LoanService);
  private eventService = inject(EventService);

  private userId = Number(this.route.snapshot.paramMap.get('id'));

  // true tant que la requête HTTP des emprunts n'a pas répondu
  loadingLoans = signal(true);
  deleteError  = signal<string | null>(null);

  user  = toSignal(this.userService.getById(this.userId));
  loans = toSignal(
    this.loanService.getByUser(this.userId).pipe(
      tap({ next: () => this.loadingLoans.set(false), error: () => this.loadingLoans.set(false) })
    ),
    { initialValue: [] as Loan[] }
  );

  // Tous les events (gestionnaire) — on filtre sur les loan IDs de cet utilisateur
  private allEvents = toSignal(this.eventService.getAll(), { initialValue: [] });

  ongletActif = signal<'infos' | 'emprunts' | 'statistiques'>('infos');

  loanStats = computed(() => {
    const l      = this.loans();
    const now    = new Date();
    const loanIds = new Set(l.map(x => x.id));
    // Incidents BREAKDOWN liés aux emprunts de cet utilisateur
    const incidents = this.allEvents().filter(
      e => e.type === 'BREAKDOWN' && loanIds.has(e.loan?.id)
    ).length;
    return {
      total:     l.length,
      enCours:   l.filter(x => x.statusType === 'VALID').length,
      enAttente: l.filter(x => x.statusType === 'IN_PROGRESS').length,
      termine:   l.filter(x => x.statusType === 'TERMINE').length,
      enRetard:  l.filter(x => x.statusType === 'VALID' && new Date(x.endDate) < now).length,
      incidents,
    };
  });

  retour(): void {
    this.location.back();
  }

  // Navigue vers la page d'édition de l'utilisateur
  edit(): void {
    this.router.navigate(['/utilisateurs', this.userId, 'edit']);
  }

  // Demande confirmation puis supprime l'utilisateur via le back, puis redirige vers la liste
  delete(): void {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.deleteError.set(null);
    this.userService.delete(this.userId).subscribe({
      next: () => this.router.navigate(['/utilisateurs']),
      error: (err) => {
        if (err.status === 409) {
          this.deleteError.set('Impossible de supprimer cet utilisateur : il a un ou plusieurs emprunts en cours (matériel sorti). Récupérez le matériel avant de supprimer le compte.');
        } else {
          this.deleteError.set('Une erreur est survenue lors de la suppression.');
        }
      }
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
    const classes: Record<LoanDisplayStatus, string>
 = {
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
