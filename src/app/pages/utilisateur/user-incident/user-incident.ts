import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IncidentOption } from '../../../core/models/incident.model';
import { EventType } from '../../../core/models/event.model';
import { LoanService } from '../../../core/services/loan.service';
import { EventService, EventCreate } from '../../../core/services/event.service';
import { getCategoryIcon } from '../../../core/utils/category-icon';

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

  // Icône de catégorie réelle (💻 🖥️ 🥽 …) à partir du nom de la famille de l'équipement.
  protected readonly getCategoryIcon = getCategoryIcon;

  dateRange = computed(() => {
    const l = this.loan();
    if (!l) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(l.beginDate)} au ${fmt(l.endDate)}`;
  });

  // Date minimale du sélecteur de date (aujourd'hui).
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

  // Formulaire pour une panne : description obligatoire.
  breakdownForm = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Formulaire pour un retour anticipé ou une prolongation : date obligatoire, motif facultatif.
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
      this.sendEvent({
        type: 'BREAKDOWN',
        description: this.breakdownForm.value.description ?? null,
        loanId: this.loanId
      });
      return;
    }

    // Retour anticipé et prolongation suivent le même traitement : une date demandée et un motif facultatif.
    // La date part dans son champ dédié (requestedDate) ; la description ne porte que le motif.
    // La date de fin de l'emprunt ne change que lorsque le gestionnaire approuve la demande.
    if (this.dateForm.invalid) {
      this.dateForm.markAllAsTouched();
      return;
    }
    const motif = this.dateForm.value.motif?.trim();
    const defaultMotif = type === 'EARLY_RETURN' ? 'Retour anticipé demandé' : 'Prolongation demandée';
    this.sendEvent({
      type,
      description:   motif || defaultMotif,
      requestedDate: this.dateForm.value.date!,
      loanId:        this.loanId
    });
  }

  // Envoi commun du signalement, avec la même gestion d'erreur pour les trois types.
  private sendEvent(payload: EventCreate): void {
    this.submitting.set(true);
    this.eventService.create(payload).subscribe({
      next:  () => this.router.navigate(['/utilisateur/mes-emprunts']),
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.status === 403
          ? 'Action non autorisée.'
          : 'Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }
}
