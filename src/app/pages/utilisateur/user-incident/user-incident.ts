import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IncidentType, IncidentOption } from '../../../core/models/incident.model';
import { LoanService } from '../../../core/services/loan.service';
import { EventService } from '../../../core/services/event.service';
import { EventType } from '../../../core/models/event.model';

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

  // Charge le vrai emprunt par ID (LoanView : equipment.equipmentName, beginDate, endDate)
  loan = toSignal(this.loanService.getById(this.loanId));

  dateRange = computed(() => {
    const l = this.loan();
    if (!l) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(l.beginDate)} au ${fmt(l.endDate)}`;
  });

  incidentOptions: IncidentOption[] = [
    { type: 'BREAKDOWN',    label: 'Panne',           icon: '🔴' },
    { type: 'EARLY_RETURN', label: 'Retour anticipé', icon: '↩️' },
    { type: 'EXTENSION',    label: 'Prolongation',    icon: '📅' },
  ];

  selectedType = signal<IncidentType | null>(null);
  submitting   = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    type:        [null as IncidentType | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  get type()        { return this.form.get('type')!;        }
  get description() { return this.form.get('description')!; }

  selectType(incidentType: IncidentType): void {
    this.selectedType.set(incidentType);
    this.type.setValue(incidentType);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.eventService.create({
      type:        this.form.value.type as EventType,
      description: this.form.value.description ?? null,
      loan:        { id: this.loanId }
    }).subscribe({
      next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 403) {
          this.errorMessage.set('Vous n\'êtes pas autorisé à effectuer cette action.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }
}
