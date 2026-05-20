import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProfilService } from '../../../core/services/profil.service';
import { UserService } from '../../../core/services/user.service';
import { AppUserCreate } from '../../../core/models/user.model';
import { Profil, ProfilType } from '../../../core/models/profil.model';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss'
})
export class UserCreateComponent {
  private fb            = inject(FormBuilder);
  private router        = inject(Router);
  private location      = inject(Location);
  private profilService = inject(ProfilService);
  private userService   = inject(UserService);

  profils = toSignal(this.profilService.getAll(), { initialValue: [] as Profil[] });

  submitted  = signal(false);
  showPwd    = signal(false);
  showPwdCfm = signal(false);

  private matchPasswords(group: AbstractControl): ValidationErrors | null {
    const pwd     = group.get('password')?.value;
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
    name:            ['', [Validators.required, Validators.minLength(2)]],
    lastname:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    profilId:        ['', Validators.required],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.matchPasswords });

  get f() { return this.form.controls; }

  getProfilLabel(type: ProfilType): string {
    const labels: Record<ProfilType, string> = {
      GESTIONNAIRE:  'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT:   'Intervenant',
      STAGIAIRE:     'Stagiaire',
    };
    return labels[type] ?? type;
  }

  retour(): void {
    this.location.back();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const payload: AppUserCreate = {
      name:     val.name!,
      lastname: val.lastname!,
      email:    val.email!,
      password: val.password!,
      profilId: Number(val.profilId),
    };
    this.userService.create(payload).subscribe(() => {
      this.router.navigate(['/utilisateurs']);
    });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }
}
