import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppUser } from '../../../core/models/user.model';
import { Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private router      = inject(Router);
  private userService = inject(UserService);
  private loanService = inject(LoanService);
  private authService = inject(AuthService);

  // Chargement de l'utilisateur courant via subscribe → signal mutable
  // (permet mise à jour optimiste après PUT email)
  private userSig = signal<AppUser | undefined>(undefined);
  user = this.userSig.asReadonly();

  // Emprunts pour les stats
  private loansSig = signal<Loan[]>([]);

  ngOnInit(): void {
    const userId = this.authService.currentUser()!.id;
    this.userService.getMe().subscribe(u => this.userSig.set(u));
    this.loanService.getByUser(userId).subscribe(l => this.loansSig.set(l));
  }

  // ── Valeurs dérivées ───────────────────────────────────
  initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.name[0]}${u.lastname[0]}`.toUpperCase();
  });

  roleLabel = computed(() => {
    const map: Record<string, string> = {
      GESTIONNAIRE: 'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT: 'Intervenant',
      STAGIAIRE: 'Stagiaire'
    };
    const type = this.user()?.profil?.type;
    return type ? (map[type] ?? type) : '';
  });

  stats = computed(() => {
    const loans = this.loansSig();
    return [
      { label: 'Emprunts effectués', value: loans.length },
      { label: 'En cours',           value: loans.filter(l => l.statusType === 'VALID').length },
      { label: 'En attente',         value: loans.filter(l => l.statusType === 'IN_PROGRESS').length },
    ];
  });

  // ── Formulaires inline ─────────────────────────────────
  activeEdit     = signal<'email' | 'password' | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage   = signal<string | null>(null);
  submitting     = signal(false);

  // Validator de correspondance entre deux champs
  private matchValidator(field1: string, field2: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const val1 = group.get(field1)?.value;
      const val2 = group.get(field2)?.value;
      if (val1 && val2 && val1 !== val2) {
        group.get(field2)?.setErrors({ mismatch: true });
      } else {
        const errs = group.get(field2)?.errors;
        if (errs?.['mismatch']) {
          const { mismatch, ...rest } = errs;
          group.get(field2)?.setErrors(Object.keys(rest).length ? rest : null);
        }
      }
      return null;
    };
  }

  emailForm = this.fb.group({
    newEmail:     ['', [Validators.required, Validators.email]],
    confirmEmail: ['', [Validators.required, Validators.email]]
  }, { validators: this.matchValidator('newEmail', 'confirmEmail') });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.matchValidator('newPassword', 'confirmPassword') });

  toggleEdit(field: 'email' | 'password') {
    if (this.activeEdit() === field) {
      this.closeEdit();
    } else {
      this.activeEdit.set(field);
      this.emailForm.reset();
      this.passwordForm.reset();
      this.clearMessages();
    }
  }

  closeEdit() {
    this.activeEdit.set(null);
    this.emailForm.reset();
    this.passwordForm.reset();
    this.clearMessages();
    this.submitting.set(false);
  }

  clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  submitEmail() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const newEmail = this.emailForm.value.newEmail!;
    this.submitting.set(true);
    this.userService.updateEmail(this.authService.currentUser()!.id, newEmail).subscribe({
      next: () => {
        // Mise à jour optimiste du signal local
        this.userSig.update(u => u ? { ...u, email: newEmail } : u);
        this.successMessage.set('Email mis à jour.');
        setTimeout(() => this.closeEdit(), 1500);
      },
      error: () => {
        this.errorMessage.set('Une erreur est survenue.');
        this.submitting.set(false);
      }
    });
  }

  submitPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const currentPassword = this.passwordForm.value.currentPassword!;
    const newPassword     = this.passwordForm.value.newPassword!;
    this.submitting.set(true);
    // Use /user/:id/password — back vérifie que l'utilisateur ne modifie que son propre mot de passe
    this.userService.updatePassword(this.authService.currentUser()!.id, currentPassword, newPassword).subscribe({
      next: () => {
        this.successMessage.set('Mot de passe mis à jour.');
        setTimeout(() => this.closeEdit(), 1500);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage.set('Mot de passe actuel incorrect.');
        } else {
          this.errorMessage.set('Une erreur est survenue.');
        }
        this.submitting.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
