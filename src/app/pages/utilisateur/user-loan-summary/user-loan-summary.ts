import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EquipmentService } from '../../../core/services/equipment.service';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Equipment } from '../../../core/models/equipment.model';
import { getCategoryIcon } from '../../../core/utils/category-icon';

// Forme du navigation state attendu depuis user-catalogue
// Les dates sont en format YYYY-MM-DD (input[type=date]) — directement compatibles avec LocalDate du back
interface LoanSummaryState {
  equipmentIds: number[];
  beginDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

@Component({
  selector: 'app-user-loan-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-loan-summary.html',
  styleUrl: './user-loan-summary.scss'
})
export class UserLoanSummaryComponent implements OnInit {
  private router           = inject(Router);
  private equipmentService = inject(EquipmentService);
  private loanService      = inject(LoanService);
  private authService      = inject(AuthService);

  // Récupéré depuis le navigation state passé par user-catalogue
  private state = this.router.getCurrentNavigation()?.extras?.state as LoanSummaryState | undefined;

  equipments     = signal<Equipment[]>([]);
  loading        = signal(true);
  submitting     = signal(false);
  forbiddenError = signal(false);
  submitError    = signal<string | null>(null);

  readonly beginDate = this.state?.beginDate ?? '';
  readonly endDate   = this.state?.endDate   ?? '';

  // Nombre de jours entre début et fin
  duration = computed(() => {
    if (!this.beginDate || !this.endDate) return 0;
    const diff = new Date(this.endDate).getTime() - new Date(this.beginDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  // true = emprunt groupé (2+ équipements), false = emprunt solo
  isGrouped = computed(() => this.equipments().length > 1);

  ngOnInit(): void {
    // Si aucun state (accès direct à la route), on renvoie au catalogue
    if (!this.state?.equipmentIds?.length) {
      this.router.navigate(['/utilisateur/catalogue']);
      return;
    }

    // Charge les détails de chaque équipement sélectionné
    const requests = this.state.equipmentIds.map(id => this.equipmentService.getById(id));
    forkJoin(requests).subscribe({
      next: (equipments) => {
        this.equipments.set(equipments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.submitError.set('Impossible de charger les équipements. Retournez au catalogue.');
      }
    });
  }

  confirm(): void {
    const user = this.authService.currentUser();
    if (this.submitting() || !user || !this.state) return;

    this.submitting.set(true);
    this.forbiddenError.set(false);
    this.submitError.set(null);

    const ids = this.state.equipmentIds;
    // groupId généré uniquement pour les emprunts groupés (2+ équipements)
    const groupId = ids.length > 1 ? crypto.randomUUID() : undefined;

    const requests = ids.map(id =>
      this.loanService.create({
        beginDate:   this.beginDate,
        endDate:     this.endDate,
        requesterId: user.id,
        equipmentId: id,
        groupId:     groupId,
      })
    );

    forkJoin(requests).subscribe({
      next: () => this.router.navigate(['/utilisateur/confirmation']),
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 403) {
          // Le profil de l'utilisateur n'autorise pas la famille d'un équipement sélectionné
          this.forbiddenError.set(true);
        } else if (err.status === 409) {
          // Un autre utilisateur a réservé cet équipement entre la sélection et la confirmation
          this.submitError.set('Un équipement n\'est plus disponible sur cette période. Retournez au catalogue pour en choisir un autre.');
        } else {
          this.submitError.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/utilisateur/catalogue']);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  getCategoryIcon(familyName: string): string {
    return getCategoryIcon(familyName);
  }
}
