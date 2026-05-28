import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExportComponent } from '../../../shared/export/export';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';

// RETARD n'est pas un statut en base — calculé côté front : VALID + endDate < now
type LoanDisplayStatus = StatusLoanType | 'RETARD';

// Représente un groupe d'emprunts partageant le même groupId
interface LoanGroup {
  groupId: string;
  loans: Loan[];
  borrowerName: string;
  equipmentNames: string[];
  beginDate: string;
  endDate: string;
}

@Component({
  selector: 'app-loan',
  standalone: true,
  imports: [CommonModule, ExportComponent],
  templateUrl: './loan.html',
  styleUrl: './loan.scss'
})
export class LoanComponent {

  private router        = inject(Router);
  private loanService   = inject(LoanService);
  private eventService  = inject(EventService);

  filtreStatut = signal<string>('tous');
  filtreTemps  = signal<string>('tout');

  // Signal mutable — peuplé via HTTP et mis à jour après chaque action
  loans = signal<Loan[]>([]);

  // Compteurs retours anticipés / prolongations (depuis les events)
  private events = signal<{ type: string }[]>([]);

  earlyReturnCount = computed(() =>
    this.events().filter(e => e.type === 'EARLY_RETURN').length
  );

  extensionCount = computed(() =>
    this.events().filter(e => e.type === 'EXTENSION').length
  );

  // Tracks which group detail panel is open (null = aucun)
  openGroupId = signal<string | null>(null);

  constructor() {
    this.chargerEmprunts();
    this.eventService.getAll().subscribe(data => this.events.set(data));
  }

  private chargerEmprunts(): void {
    this.loanService.getAll().subscribe(data => this.loans.set(data));
  }

  // Emprunts individuels en attente (groupId null ou absent)
  individualPendingLoans = computed(() =>
    this.loans().filter(l => l.statusType === 'IN_PROGRESS' && !l.groupId)
  );

  // Emprunts groupés en attente — regroupés par groupId
  groupedPendingLoans = computed((): LoanGroup[] => {
    const grouped = this.loans().filter(l => l.statusType === 'IN_PROGRESS' && !!l.groupId);
    const map = new Map<string, Loan[]>();
    grouped.forEach(l => {
      const existing = map.get(l.groupId!) ?? [];
      map.set(l.groupId!, [...existing, l]);
    });
    return Array.from(map.entries()).map(([groupId, loans]) => ({
      groupId,
      loans,
      borrowerName:   `${loans[0].requester.name} ${loans[0].requester.lastname}`,
      equipmentNames: loans.map(l => l.equipment.equipmentName),
      beginDate:      loans[0].beginDate,
      endDate:        loans[0].endDate,
    }));
  });

  // "En cours" = emprunts actifs (VALID), filtrés par statut et période
  activeLoans = computed(() => {
    const now = new Date();
    let list = this.loans().filter(l => l.statusType === 'VALID');

    const statut = this.filtreStatut();
    if (statut === 'IN_PROGRESS') list = list.filter(l => new Date(l.endDate) >= now);
    if (statut === 'RETARD')      list = list.filter(l => new Date(l.endDate) < now);

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

  isRetard(loan: Loan): boolean {
    return loan.statusType === 'VALID' && new Date(loan.endDate) < new Date();
  }

  getDisplayStatus(loan: Loan): LoanDisplayStatus {
    return this.isRetard(loan) ? 'RETARD' : loan.statusType;
  }

  // ── Actions emprunts individuels ─────────────────────

  validateLoan(loan: Loan): void {
    this.loanService.validate(loan.id).subscribe(() => this.chargerEmprunts());
  }

  refuseLoan(loan: Loan): void {
    this.loanService.invalidate(loan.id).subscribe(() => this.chargerEmprunts());
  }

  returnLoan(loan: Loan): void {
    this.loanService.return(loan.id).subscribe(() => this.chargerEmprunts());
  }

  // ── Actions emprunts groupés ──────────────────────────

  validateGroup(groupId: string): void {
    this.loanService.validateGroup(groupId).subscribe(() => this.chargerEmprunts());
  }

  refuseGroup(groupId: string): void {
    this.loanService.refuseGroup(groupId).subscribe(() => this.chargerEmprunts());
  }

  toggleGroupDetail(groupId: string): void {
    this.openGroupId.update(v => v === groupId ? null : groupId);
  }

  // ── Export ────────────────────────────────────────────

  loansExport = computed(() =>
    this.loans().map(l => ({
      id:          l.id,
      equipement:  l.equipment.equipmentName,
      emprunteur:  this.getBorrowerName(l),
      debut:       l.beginDate,
      fin:         l.endDate,
      statut:      this.getStatusLabel(this.getDisplayStatus(l)),
      groupe:      l.groupId ?? '—',
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

  getGroupInitials(group: LoanGroup): string {
    const loans = group.loans;
    return loans[0].requester.name[0] + loans[0].requester.lastname[0];
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
