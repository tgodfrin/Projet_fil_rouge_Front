import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IncidentOption } from '../../../core/models/incident.model';
import { EventType } from '../../../core/models/event.model';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-user-incident',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-incident.html',
  styleUrl: './user-incident.scss'
})
export class UserIncidentComponent {
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);
  private fb           = inject(FormBuilder);
  private loanService  = inject(LoanService);
  private eventService = inject(EventService);

  loanId = Number(this.route.snapshot.paramMap.get('id'));

  loan = toSignal(this.loanService.getById(this.loanId));

  dateRange = computed(() => {
    const l = this.loan();
    if (!l) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(l.beginDate)} au ${fmt(l.endDate)}`;
  });

  // Date minimale pour le date picker (aujourd'hui)
  todayString = (() => {
    const d = new Date();
    return d.getFullYear() + '-'
      + String(d.getMonth() + 1).padStart(2, '0') + '-'
      + String(d.getDate()).padStart(2, '0');
  })();

  incidentOptions: IncidentOption[] = [
    { type: 'BREAKDOWN',    label: 'Panne',           icon: 'warning' },
    { type: 'EARLY_RETURN', label: 'Retour anticipé', icon: 'return'  },
    { type: 'EXTENSION',    label: 'Prolongation',    icon: 'extend'  },
  ];

  selectedType = signal<EventType | null>(null);
  submitting   = signal(false);
  errorMessage = signal<string | null>(null);

  // Form pour BREAKDOWN (description requise)
  breakdownForm = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Form pour EARLY_RETURN et EXTENSION (date requise + motif optionnel)
  dateForm = this.fb.group({
    date:  ['', Validators.required],
    motif: ['']
  });

  get description() { return this.breakdownForm.get('description')!; }
  get date()        { return this.dateForm.get('date')!; }

  selectType(incidentType: EventType): void {
    this.selectedType.set(incidentType);
    this.errorMessage.set(null);
    this.breakdownForm.reset();
    this.dateForm.reset();
  }

  submit(): void {
    const type = this.selectedType();
    if (!type) return;

    this.errorMessage.set(null);

    if (type === 'BREAKDOWN') {
      if (this.breakdownForm.invalid) {
        this.breakdownForm.markAllAsTouched();
        return;
      }
      this.submitting.set(true);
      this.eventService.create({
        type: 'BREAKDOWN',
        description: this.breakdownForm.value.description ?? null,
        loanId: this.loanId
      }).subscribe({
        next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.status === 403
            ? 'Action non autorisée.'
            : 'Une erreur est survenue. Veuillez réessayer.');
        }
      });

    } else if (type === 'EARLY_RETURN') {
      // Crée un Event EARLY_RETURN — le gestionnaire voit la demande dans les alertes
      // et marque l'emprunt comme rendu manuellement. L'emprunt reste visible côté user jusqu'à là.
      if (this.dateForm.invalid) {
        this.dateForm.markAllAsTouched();
        return;
      }
      const date  = this.dateForm.value.date!;
      const motif = this.dateForm.value.motif?.trim();
      // La date demandée part dans son champ dédié (requestedDate) ; la description ne porte que le motif
      this.submitting.set(true);
      this.eventService.create({
        type:          'EARLY_RETURN',
        description:   motif || 'Retour anticipé demandé',
        requestedDate: date,
        loanId:        this.loanId
      }).subscribe({
        next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.status === 403
            ? 'Action non autorisée.'
            : 'Une erreur est survenue. Veuillez réessayer.');
        }
      });

    } else if (type === 'EXTENSION') {
      // Crée un Event EXTENSION — le gestionnaire valide depuis les alertes.
      // La date de fin ne change que quand le gestionnaire approuve.
      if (this.dateForm.invalid) {
        this.dateForm.markAllAsTouched();
        return;
      }
      const newEndDate = this.dateForm.value.date!;
      const motif      = this.dateForm.value.motif?.trim();
      // La nouvelle date part dans son champ dédié (requestedDate) ; la description ne porte que le motif
      this.submitting.set(true);
      this.eventService.create({
        type:          'EXTENSION',
        description:   motif || 'Prolongation demandée',
        requestedDate: newEndDate,
        loanId:        this.loanId
      }).subscribe({
        next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.status === 403
            ? 'Action non autorisée.'
            : 'Une erreur est survenue. Veuillez réessayer.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }
}
