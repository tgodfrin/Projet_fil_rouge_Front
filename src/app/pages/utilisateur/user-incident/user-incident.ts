import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

export type IncidentType = 'DYSFONCTIONNEMENT' | 'PANNE' | 'DEGRADATION' | 'AUTRE';

interface IncidentOption {
  type: IncidentType;
  label: string;
  icon: string;
}

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

  loanId = this.route.snapshot.paramMap.get('id');

  loan = {
    equipmentName: 'MacBook Pro M3',
    categoryIcon: '💻',
    dateRange: '10 au 17 avr. 2026'
  };

  incidentOptions: IncidentOption[] = [
    { type: 'DYSFONCTIONNEMENT', label: 'Dysfonctionnement', icon: '⚠️' },
    { type: 'PANNE',             label: 'Panne',             icon: '🔴' },
    { type: 'DEGRADATION',       label: 'Dégradation',       icon: '💥' },
    { type: 'AUTRE',             label: 'Autre',             icon: '❓' },
  ];

  form = this.fb.group({
    type:        [null as IncidentType | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  get type()        { return this.form.get('type')!;        }
  get description() { return this.form.get('description')!; }

  selectType(incidentType: IncidentType): void {
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