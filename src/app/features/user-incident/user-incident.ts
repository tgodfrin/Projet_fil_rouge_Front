import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './user-incident.html',
  styleUrl: './user-incident.scss'
})
export class UserIncidentComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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

  selectedType = signal<IncidentType | null>(null);
  description = signal('');

  selectType(type: IncidentType): void {
    this.selectedType.set(type);
  }

  onDescriptionChange(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }

  canSubmit(): boolean {
    return this.selectedType() !== null && this.description().trim().length > 0;
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }

  goBack(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }
}