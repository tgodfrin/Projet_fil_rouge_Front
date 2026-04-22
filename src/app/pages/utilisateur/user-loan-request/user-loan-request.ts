import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-loan-request.html',
  styleUrl: './user-loan-request.scss'
})
export class UserLoanRequestComponent {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);

  equipmentId = this.route.snapshot.paramMap.get('id');

  // Données mockées — à remplacer par appel API
  equipmentMap: Record<string, Equipment> = {
    '1': { id: 1, name: 'MacBook Pro M3',       ref: 'REF-PC-042',  category: 'PC',           icon: '💻' },
    '2': { id: 2, name: 'HP EliteBook 840',      ref: 'REF-PC-031',  category: 'PC',           icon: '💻' },
    '3': { id: 3, name: 'Meta Quest 3',          ref: 'REF-VR-008',  category: 'VR',           icon: '🥽' },
    '4': { id: 4, name: 'iPad Pro 12.9"',        ref: 'REF-TAB-007', category: 'Tablette',     icon: '📱' },
    '5': { id: 5, name: 'Samsung Galaxy Tab',    ref: 'REF-TAB-012', category: 'Tablette',     icon: '📱' },
    '6': { id: 6, name: 'Dell UltraSharp 27"',   ref: 'REF-ECR-003', category: 'Écran',        icon: '🖥️' },
    '7': { id: 7, name: 'LG 4K 32"',             ref: 'REF-ECR-009', category: 'Écran',        icon: '🖥️' },
    '8': { id: 8, name: 'Clavier Keychron K2',   ref: 'REF-PER-015', category: 'Périphérique', icon: '⌨️' },
    '9': { id: 9, name: 'Souris Logitech MX',    ref: 'REF-PER-021', category: 'Périphérique', icon: '🖱️' },
  };

  equipment = computed(() =>
    this.equipmentId ? (this.equipmentMap[this.equipmentId] ?? null) : null
  );

  currentStep = signal(1);

  form = this.fb.group({
    startDate: ['', Validators.required],
    endDate:   ['', Validators.required],
    motif:     ['', [Validators.required, Validators.minLength(5)]]
  });

  // ── Accesseurs FormControl ─────────────────────────────
  get startDateCtrl() { return this.form.get('startDate')!; }
  get endDateCtrl()   { return this.form.get('endDate')!;   }
  get motifCtrl()     { return this.form.get('motif')!;     }

  // ── Valeurs calculées depuis le formulaire ─────────────
  get duration(): number {
    const s = this.form.value.startDate;
    const e = this.form.value.endDate;
    if (!s || !e) return 0;
    return Math.max(0, Math.ceil(
      (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)
    ));
  }

  get formattedReturn(): string {
    const e = this.form.value.endDate;
    if (!e) return '';
    return new Date(e).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  get formattedRange(): string {
    const s = this.form.value.startDate;
    const e = this.form.value.endDate;
    if (!s || !e) return '';
    const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
      new Date(d).toLocaleDateString('fr-FR', opts);
    return `${fmt(s, { day: 'numeric', month: 'short' })} au ${fmt(e, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  // ── Navigation stepper ─────────────────────────────────
  nextStep(): void {
    if (this.form.invalid || this.duration <= 0) {
      this.form.markAllAsTouched();
      return;
    }
    this.currentStep.set(2);
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

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}