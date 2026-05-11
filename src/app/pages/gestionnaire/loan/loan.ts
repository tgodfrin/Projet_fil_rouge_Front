import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExportComponent } from '../../../shared/export/export';
import { LoanService } from '../../../core/services/loan.service';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';

// RETARD n'est pas un statut en base — calculé côté front : IN_PROGRESS + endDate < now
type LoanDisplayStatus = StatusLoanType | 'RETARD';

@Component({
  selector: 'app-loan',
  standalone: true,
  imports: [CommonModule, ExportComponent],
  templateUrl: './loan.html',
  styleUrl: './loan.scss'
})
export class LoanComponent {

  private router      = inject(Router);
  private loanService = inject(LoanService);

  filtreStatut = signal<string>('tous');
  filtreTemps  = signal<string>('tout');

  // Signal mutable — peuplé via HTTP et mis à jour après chaque action
  loans = signal<Loan[]>([]);

  constructor() {
    this.chargerEmprunts();
  }

  // Rechargement de la liste depuis le back
  private chargerEmprunts(): void {
    this.loanService.getAll().subscribe(data => this.loans.set(data));
  }

  // "À valider" = demandes en attente de validation (statusType IN_PROGRESS = créé, pas encore validé)
  pendingLoans = computed(() =>
    this.loans().filter(l => l.statusType === 'IN_PROGRESS')
  );

  // "En cours" = emprunts actifs (VALID = validés par gestionnaire), filtrés par statut et période
  activeLoans = computed(() => {
    const now = new Date();
    let list = this.loans().filter(l => l.statusType === 'VALID');

    // Filtre statut : "En cours" = non retard / "Retard" = endDate dépassée
    const statut = this.filtreStatut();
    if (statut === 'IN_PROGRESS') list = list.filter(l => new Date(l.endDate) >= now);
    if (statut === 'RETARD')      list = list.filter(l => new Date(l.endDate) < now);

    // Filtre temporalité
    const temps = this.filtreTemps();
    if (temps === 'semaine') {
      const debutSemaine = new Date(now);
      debutSemaine.setDate(now.getDate() - now.getDay() + 1);
      const finSemaine = new Date(debutSemaine);
      finSemaine.setDate(debutSemaine.getDate() + 6);
      list = list.filter(l => {
        const d = new Date(l.beginDate);
        return d >= debutSemaine && d <= finSemaine;
      });
    }
    if (temps === 'mois') {
      list = list.filter(l => {
        const d = new Date(l.beginDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    return list;
  });

  // RETARD = VALID dont endDate est dépassée
  isRetard(loan: Loan): boolean {
    return loan.statusType === 'VALID' && new Date(loan.endDate) < new Date();
  }

  getDisplayStatus(loan: Loan): LoanDisplayStatus {
    return this.isRetard(loan) ? 'RETARD' : loan.statusType;
  }

  // Valider : IN_PROGRESS → VALID
  // validatorId = 2 (Marc Dubois, GESTIONNAIRE) — sera remplacé par le user connecté en Phase 3 JWT
  validateLoan(loan: Loan): void {
    this.loanService.validate(loan.id, 2).subscribe(() => this.chargerEmprunts());
  }

  // Refuser : VALID → INVALID
  refuseLoan(loan: Loan): void {
    this.loanService.invalidate(loan.id).subscribe(() => this.chargerEmprunts());
  }

  // Retour matériel : IN_PROGRESS → TERMINE
  returnLoan(loan: Loan): void {
    this.loanService.return(loan.id).subscribe(() => this.chargerEmprunts());
  }

  loansExport = computed(() =>
    this.loans().map(l => ({
      id:          l.id,
      equipement:  l.equipment.equipmentName,
      emprunteur:  this.getBorrowerName(l),
      debut:       l.beginDate,
      fin:         l.endDate,
      statut:      this.getStatusLabel(this.getDisplayStatus(l)),
      commentaire: ''
    }))
  );

  onFiltreStatutChange(event: Event): void {
    this.filtreStatut.set((event.target as HTMLSelectElement).value);
  }

  onFiltreTempsChange(event: Event): void {
    this.filtreTemps.set((event.target as HTMLSelectElement).value);
  }

  getBorrowerName(loan: Loan): string {
    return `${loan.requester.name} ${loan.requester.lastname}`;
  }

  getBorrowerInitials(loan: Loan): string {
    return loan.requester.name[0] + loan.requester.lastname[0];
  }

  getStatusLabel(status: LoanDisplayStatus): string {
    const labels: Record<LoanDisplayStatus, string> = {
      IN_PROGRESS: 'En attente',
      VALID:       'En cours',
      RETARD:      'Retard',
      TERMINE:     'Terminé',
      INVALID:     'Refusé'
    };
    return labels[status];
  }

  getStatusClass(status: LoanDisplayStatus): string {
    const classes: Record<LoanDisplayStatus, string> = {
      IN_PROGRESS: 'badge-warning',
      VALID:       'badge-success',
      RETARD:      'badge-danger',
      TERMINE:     'badge-neutral',
      INVALID:     'badge-danger'
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
