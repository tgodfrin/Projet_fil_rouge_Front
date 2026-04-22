import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IncidentType, IncidentOption } from '../../../core/models/incident.model';

interface LoanInfo {
  id: number;
  equipmentName: string;
  categoryIcon: string;
  startDate: string;
  endDate: string;
}

const MOCK_LOANS: Record<number, LoanInfo> = {
  1: { id: 1, equipmentName: 'MacBook Pro 14"',      categoryIcon: '💻', startDate: '2026-04-01', endDate: '2026-04-20' },
  2: { id: 2, equipmentName: 'Appareil photo Sony A7',categoryIcon: '📷', startDate: '2026-04-10', endDate: '2026-04-18' },
  3: { id: 3, equipmentName: 'Vidéoprojecteur Epson', categoryIcon: '📽️', startDate: '2026-04-20', endDate: '2026-04-25' },
  4: { id: 4, equipmentName: 'iPad Pro 12.9"',        categoryIcon: '📱', startDate: '2026-03-01', endDate: '2026-03-15' },
};

@Component({
  selector: 'app-user-incident',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-incident.html',
  styleUrl: './user-incident.scss'
})
export class UserIncidentComponent {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);

  loanId = Number(this.route.snapshot.paramMap.get('id'));

  loan = signal<LoanInfo | null>(MOCK_LOANS[this.loanId] ?? null);

  dateRange = computed(() => {
    const l = this.loan();
    if (!l) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(l.startDate)} au ${fmt(l.endDate)}`;
  });

  incidentOptions: IncidentOption[] = [
    { type: 'PANNE',           label: 'Panne',           icon: '🔴' },
    { type: 'RETOUR_ANTICIPE', label: 'Retour anticipé', icon: '↩️' },
    { type: 'PROLONGATION',    label: 'Prolongation',    icon: '📅' },
  ];

  selectedType = signal<IncidentType | null>(null);

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
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }

  goBack(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }
}
