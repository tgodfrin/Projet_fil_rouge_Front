import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EquipmentService } from '../../../core/services/equipment.service';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Equipment } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-user-loan-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-loan-request.html',
  styleUrl: './user-loan-request.scss'
})
export class UserLoanRequestComponent {
  private router           = inject(Router);
  private route            = inject(ActivatedRoute);
  private fb               = inject(FormBuilder);
  private equipmentService = inject(EquipmentService);
  private loanService      = inject(LoanService);
  private authService      = inject(AuthService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  // Détails de l'équipement chargés par ID (EquipmentView complet)
  equipment = toSignal(this.equipmentService.getById(this.equipmentId));

  // Disponibilité vérifiée au passage à l'étape 2
  private availableEquipments = signal<Equipment[]>([]);
  availabilityChecked = signal(false);
  isAvailable = computed(() =>
    this.availableEquipments().some(e => e.id === this.equipmentId)
  );

  currentStep     = signal(1);
  submitting      = signal(false);
  // Message d'erreur affiché si le back renvoie 403 (profil non autorisé)
  forbiddenError  = signal(false);

  form = this.fb.group({
    startDate: ['', Validators.required],
    endDate:   ['', Validators.required],
  });

  // ── Accesseurs FormControl ─────────────────────────────
  get startDateCtrl() { return this.form.get('startDate')!; }
  get endDateCtrl()   { return this.form.get('endDate')!;   }

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
    // Vérification disponibilité via API avant de passer à l'étape 2
    const begin = `${this.form.value.startDate}T08:00:00`;
    const end   = `${this.form.value.endDate}T18:00:00`;
    this.equipmentService.getAvailable(begin, end).subscribe(list => {
      this.availableEquipments.set(list);
      this.availabilityChecked.set(true);
      this.currentStep.set(2);
    });
  }

  prevStep(): void {
    this.currentStep.set(1);
    this.availabilityChecked.set(false);
  }

  submit(): void {
    const user = this.authService.currentUser();
    if (!this.isAvailable() || this.submitting() || !user) return;
    this.submitting.set(true);
    this.forbiddenError.set(false);
    this.loanService.create({
      beginDate:   `${this.form.value.startDate}T08:00:00`,
      endDate:     `${this.form.value.endDate}T18:00:00`,
      requesterId: user.id,
      equipmentId: this.equipmentId
    }).subscribe({
      next: () => this.router.navigate(['/utilisateur/confirmation']),
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 403) {
          // Le profil utilisateur n'autorise pas la famille de cet équipement
          this.forbiddenError.set(true);
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/utilisateur/catalogue']);
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
