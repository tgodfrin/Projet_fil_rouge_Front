import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IncidentType, IncidentOption } from '../../../core/models/incident.model';
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
    { type: 'EARLY_RETURN', label: 'Retour anticipe', icon: 'return'  },
    { type: 'EXTENSION',    label: 'Prolongation',    icon: 'extend'  },
  ];

  selectedType = signal<IncidentType | null>(null);
  submitting   = signal(false);
  errorMessage = signal<string | null>(null);

  // Form pour BREAKDOWN (description requise)
  breakdownForm = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Form pour EARLY_RETURN et EXTENSION (date requise)
  dateForm = this.fb.group({
    date: ['', Validators.required]
  });

  get description() { return this.breakdownForm.get('description')!; }
  get date()        { return this.dateForm.get('date')!; }

  selectType(incidentType: IncidentType): void {
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
            ? 'Action non autorisee.'
            : 'Une erreur est survenue. Veuillez reessayer.');
        }
      });

    } else if (type === 'EARLY_RETURN') {
      if (this.dateForm.invalid) {
        this.dateForm.markAllAsTouched();
        return;
      }
      this.submitting.set(true);
      this.loanService.returnLoan(this.loanId).subscribe({
        next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.status === 403
            ? 'Action non autorisee.'
            : 'Une erreur est survenue. Veuillez reessayer.');
        }
      });

    } else if (type === 'EXTENSION') {
      if (this.dateForm.invalid) {
        this.dateForm.markAllAsTouched();
        return;
      }
      this.submitting.set(true);
      const newEndDate = this.dateForm.value.date!;
      this.loanService.extendLoan(this.loanId, newEndDate).subscribe({
        next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
        error: (err) => {
          this.submitting.set(false);
          if (err.status === 400) {
            this.errorMessage.set('La nouvelle date doit etre apres la date de fin actuelle.');
          } else if (err.status === 403) {
            this.errorMessage.set('Action non autorisee.');
          } else {
            this.errorMessage.set('Une erreur est survenue. Veuillez reessayer.');
          }
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }
}
