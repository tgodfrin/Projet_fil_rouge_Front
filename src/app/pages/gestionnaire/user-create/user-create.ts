import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private route         = inject(ActivatedRoute);
  private location      = inject(Location);
  private profilService = inject(ProfilService);
  private userService   = inject(UserService);

  profils = toSignal(this.profilService.getAll(), { initialValue: [] as Profil[] });

  // Mode édition si un :id est présent dans la route (utilisateurs/:id/edit).
  private editId = this.route.snapshot.paramMap.get('id')
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;

  isEditMode = signal(this.editId !== null);

  submitted     = signal(false);
  showPwd       = signal(false);
  showPwdCfm    = signal(false);
  errorMessage  = signal<string | null>(null);

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

  // In edit mode, password fields are not required
  form = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(2)]],
    lastname:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    profilId:        ['', Validators.required],
    password:        [this.isEditMode() ? '' : '', this.isEditMode() ? [] : [Validators.required, Validators.minLength(8)]],
    confirmPassword: [this.isEditMode() ? '' : '', this.isEditMode() ? [] : [Validators.required]],
  }, { validators: this.isEditMode() ? [] : this.matchPasswords });

  constructor() {
    // En mode édition : on charge les données de l'utilisateur et on pré-remplit le formulaire.
    if (this.editId !== null) {
      this.userService.getById(this.editId).subscribe({
        next: (user) => {
          this.form.patchValue({
            name:     user.name,
            lastname: user.lastname,
            email:    user.email,
            profilId: String(user.profil.id),
          });
        },
        error: () => this.errorMessage.set('Impossible de charger les données utilisateur.')
      });
    }
  }

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
    this.errorMessage.set(null);

    if (this.isEditMode() && this.editId !== null) {
      // Edit mode: call update endpoint (no password)
      this.userService.update(this.editId, {
        name:     val.name!,
        lastname: val.lastname!,
        email:    val.email!,
        profilId: Number(val.profilId),
      }).subscribe({
        next: () => this.router.navigate(['/utilisateurs', this.editId]),
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage.set('Cette adresse email est déjà utilisée.');
          } else {
            this.errorMessage.set('Une erreur est survenue. Réessayez.');
          }
        }
      });
    } else {
      // En mode création : on appelle l'endpoint de création (avec mot de passe).
      const payload: AppUserCreate = {
        name:     val.name!,
        lastname: val.lastname!,
        email:    val.email!,
        password: val.password!,
        profilId: Number(val.profilId),
      };
      this.userService.create(payload).subscribe({
        next: () => this.router.navigate(['/utilisateurs']),
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage.set('Cette adresse email est déjà utilisée.');
          } else if (err.status === 400) {
            this.errorMessage.set('Données invalides. Vérifiez les champs.');
          } else {
            this.errorMessage.set('Une erreur est survenue. Réessayez.');
          }
        }
      });
    }
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }
}
