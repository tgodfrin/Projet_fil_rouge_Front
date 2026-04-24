import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss'
})
export class UserCreateComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  constructor(private location: Location) {}

  submitted  = signal(false);
  showPwd    = signal(false);
  showPwdCfm = signal(false);

  roles: { value: UserRole; label: string }[] = [
    { value: 'COLLABORATEUR', label: 'Collaborateur' },
    { value: 'INTERVENANT',   label: 'Intervenant'   },
    { value: 'STAGIAIRE',     label: 'Stagiaire'     },
    { value: 'GESTIONNAIRE',  label: 'Gestionnaire'  },
  ];

  private matchPasswords(group: AbstractControl): ValidationErrors | null {
    const pwd    = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (pwd && confirm && pwd !== confirm) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const errs = group.get('confirmPassword')?.errors;
      if (errs?.['mismatch']) {
        const { mismatch, ...rest } = errs;
        group.get('confirmPassword')?.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
    return null;
  }

  form = this.fb.group({
    name:       ['', [Validators.required, Validators.minLength(2)]],
    lastname:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    role:            ['COLLABORATEUR' as UserRole, Validators.required],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.matchPasswords });

  get f() { return this.form.controls; }

  retour(): void {
    this.location.back();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: appel API POST /utilisateurs
    console.log('Nouvel utilisateur :', this.form.value);
    this.router.navigate(['/utilisateurs']);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }
}
