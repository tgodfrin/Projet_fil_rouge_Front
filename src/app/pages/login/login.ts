import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private router      = inject(Router);
  private fb          = inject(FormBuilder);
  private http        = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiUrl = 'http://localhost:8080';

  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  loading      = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email()    { return this.form.get('email')!;    }
  get password() { return this.form.get('password')!; }

  togglePassword() { this.showPassword.update(v => !v); }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    const { email, password } = this.form.value;

    // Étape 1 : POST /login → reçoit le token JWT (string brut)
    this.http.post(
      `${this.apiUrl}/login`,
      { email, password },
      { responseType: 'text' }
    ).subscribe({
      next: (token: string) => {
        // Étape 2 : décoder le payload du JWT (base64) pour lire le rôle
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role    = payload['role'] as UserRole;

        // Étape 3 : GET /user/me avec le token pour récupérer les infos complètes
        this.http.get<{ id: number; name: string; lastname: string; email: string }>(
          `${this.apiUrl}/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).subscribe({
          next: (userInfo) => {
            // Étape 4 : persister la session
            this.authService.setSession(token, {
              id:       userInfo.id,
              name:     userInfo.name,
              lastname: userInfo.lastname,
              email:    userInfo.email ?? email,
              role
            });
            this.loading.set(false);

            // Étape 5 : redirection selon le rôle
            if (role === 'GESTIONNAIRE') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/utilisateur/accueil']);
            }
          },
          error: () => {
            this.errorMessage.set('Erreur lors du chargement du profil.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMessage.set('Email ou mot de passe incorrect.');
        this.loading.set(false);
      }
    });
  }
}
