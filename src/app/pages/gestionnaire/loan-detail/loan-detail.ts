import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, shareReplay } from 'rxjs';
import { LoanService } from '../../../core/services/loan.service';
import { UserService } from '../../../core/services/user.service';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';
import { AppUser } from '../../../core/models/user.model';

// RETARD n'est pas un statut en base — calculé côté front
type DisplayStatus = StatusLoanType | 'RETARD';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.scss'
})
export class LoanDetailComponent {

  private loanService = inject(LoanService);
  private userService = inject(UserService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private location    = inject(Location);

  private loanId = Number(this.route.snapshot.paramMap.get('id'));

  // shareReplay(1) : un seul appel HTTP pour /loan/:id,
  // partagé entre les deux toSignal()
  private loan$ = this.loanService.getById(this.loanId).pipe(shareReplay(1));

  // undefined tant que l'API n'a pas répondu — le template vérifie loan() avant d'afficher
  loan      = toSignal(this.loan$);
  requester = toSignal(
    this.loan$.pipe(switchMap(l => this.userService.getById(l.requester.id)))
  );

  // Signal d'emprunt modifiable, pour recharger après une action.
  loanData = signal<Loan | undefined>(undefined);

  constructor() {
    this.loanService.getById(this.loanId).subscribe(l => this.loanData.set(l));
  }

  private reload(): void {
    this.loanService.getById(this.loanId).subscribe(l => this.loanData.set(l));
  }

  // Actions gestionnaire

  onValidate(): void {
    this.loanService.validate(this.loanId).subscribe(() => this.reload());
  }

  onInvalidate(): void {
    this.loanService.invalidate(this.loanId).subscribe(() => this.reload());
  }

  onValidateGroup(): void {
    const groupId = this.loanData()?.groupId;
    if (!groupId) return;
    this.loanService.validateGroup(groupId).subscribe(() => this.reload());
  }

  onRefuseGroup(): void {
    const groupId = this.loanData()?.groupId;
    if (!groupId) return;
    this.loanService.refuseGroup(groupId).subscribe(() => this.reload());
  }

  // Enregistre le retour de l'emprunt (il passe à "terminé"). Visible seulement pour un emprunt validé ou en attente.
  onReturn(): void {
    this.loanService.return(this.loanId).subscribe(() => this.reload());
  }

  // Navigation

  retour(): void { this.location.back(); }

  voirEquipement(): void {
    const l = this.loan();
    if (l) this.router.navigate(['/equipements', l.equipment.id]);
  }

  voirUtilisateur(): void {
    const u = this.requester();
    if (u) this.router.navigate(['/utilisateurs', u.id]);
  }

  // Helpers affichage

  fullName(user: AppUser): string {
    return `${user.name} ${user.lastname}`;
  }

  getInitials(user: AppUser): string {
    return (user.name[0] + user.lastname[0]).toUpperCase();
  }

  // RETARD : VALID ET endDate dépassée
  getDisplayStatus(loan: Loan): DisplayStatus {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  isLate(loan: Loan): boolean {
    return this.getDisplayStatus(loan) === 'RETARD';
  }

  daysLate(loan: Loan): number {
    return Math.max(0, Math.ceil(
      (new Date().getTime() - new Date(loan.endDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
  }

  getStatusLabel(status: DisplayStatus): string {
    const labels: Record<DisplayStatus, string> = {
      IN_PROGRESS: 'En attente',
      VALID:       'En cours',
      RETARD:      'En retard',
      TERMINE:     'Terminé',
      INVALID:     'Refusé',
    };
    return labels[status];
  }

  getStatusClass(status: DisplayStatus): string {
    const classes: Record<DisplayStatus, string> = {
      IN_PROGRESS: 'b-warning',
      VALID:       'b-success',
      RETARD:      'b-danger',
      TERMINE:     'b-neutral',
      INVALID:     'b-danger',
    };
    return classes[status];
  }

  getProfilLabel(type: string): string {
    const labels: Record<string, string> = {
      GESTIONNAIRE:  'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT:   'Intervenant',
      STAGIAIRE:     'Stagiaire',
    };
    return labels[type] ?? type;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
