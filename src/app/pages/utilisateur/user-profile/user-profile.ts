import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface UserProfile {
  name: string;
  lastname: string;
  email: string;
  role: string;
  initials: string;
  memberSince: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent {
  private fb = inject(FormBuilder);

  profile = signal<UserProfile>({
    name: 'Julie',
    lastname: 'Fontaine',
    email: 'julie.fontaine@mns.fr',
    role: 'Collaboratrice',
    initials: 'JF',
    memberSince: '2024-09-03'
  });

  stats = signal([
    { label: 'Emprunts effectués', value: 12 },
    { label: 'En cours',           value: 2  },
    { label: 'En attente',         value: 1  },
  ]);

  // ── Formulaires inline ─────────────────────────────────
  activeEdit    = signal<'email' | 'password' | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage   = signal<string | null>(null);

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
    const { newEmail } = this.emailForm.value;
    this.profile.update(p => ({ ...p, email: newEmail! }));
    this.successMessage.set('Email mis à jour.');
    setTimeout(() => this.closeEdit(), 1500);
  }

  submitPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    // TODO: appel API
    this.successMessage.set('Mot de passe mis à jour.');
    setTimeout(() => this.closeEdit(), 1500);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}