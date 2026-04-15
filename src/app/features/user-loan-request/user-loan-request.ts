import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Equipment {
  id: number;
  name: string;
  ref: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-user-loan-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-loan-request.html',
  styleUrl: './user-loan-request.scss'
})
export class UserLoanRequestComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  equipmentId = this.route.snapshot.paramMap.get('id');

  // Données mockées — à remplacer par appel API
  equipmentMap: Record<string, Equipment> = {
    '1': { id: 1, name: 'MacBook Pro M3',      ref: 'REF-PC-042',  category: 'PC',          icon: '💻' },
    '4': { id: 4, name: 'iPad Pro 12.9"',       ref: 'REF-TAB-007', category: 'Tablette',    icon: '📱' },
    '6': { id: 6, name: 'Dell UltraSharp 27"',  ref: 'REF-ECR-003', category: 'Écran',       icon: '🖥️' },
    '8': { id: 8, name: 'Clavier Keychron K2',  ref: 'REF-PER-015', category: 'Périphérique', icon: '⌨️' },
  };

  equipment = computed(() =>
    this.equipmentId ? (this.equipmentMap[this.equipmentId] ?? null) : null
  );

  currentStep = signal(1);
  startDate = signal('');
  endDate = signal('');
  motif = signal('');

  duration = computed(() => {
    if (!this.startDate() || !this.endDate()) return 0;
    const diff = new Date(this.endDate()).getTime() - new Date(this.startDate()).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  formattedReturn = computed(() => {
    if (!this.endDate()) return '';
    return new Date(this.endDate()).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  });

  formattedRange = computed(() => {
    if (!this.startDate() || !this.endDate()) return '';
    const s = new Date(this.startDate()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const e = new Date(this.endDate()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} au ${e}`;
  });

  canGoNext(): boolean {
    return this.startDate() !== '' &&
           this.endDate() !== '' &&
           this.duration() > 0 &&
           this.motif().trim().length > 0;
  }

  nextStep(): void {
    if (this.canGoNext()) this.currentStep.set(2);
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  submit(): void {
    // Future : appel API POST /loans
    this.router.navigate(['/utilisateur/confirmation']);
  }

  cancel(): void {
    this.router.navigate(['/utilisateur/catalogue']);
  }

  onStartDate(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
  }

  onEndDate(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
  }

  onMotif(event: Event): void {
    this.motif.set((event.target as HTMLTextAreaElement).value);
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}