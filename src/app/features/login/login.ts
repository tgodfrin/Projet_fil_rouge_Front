import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private router  = inject(Router);
  private fb      = inject(FormBuilder);

  showPassword  = signal(false);
  errorMessage  = signal<string | null>(null);
  loading       = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  private mockUsers = [
    { email: 'admin@mns.fr', password: 'admin123', role: 'GESTIONNAIRE'  },
    { email: 'julie@mns.fr', password: 'user123',  role: 'COLLABORATEUR' },
  ];

  get email()    { return this.form.get('email')!;    }
  get password() { return this.form.get('password')!; }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    const { email, password } = this.form.value;

    setTimeout(() => {
      const user = this.mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        this.errorMessage.set('Email ou mot de passe incorrect.');
        this.loading.set(false);
        return;
      }

      this.loading.set(false);

      if (user.role === 'GESTIONNAIRE') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/utilisateur/accueil']);
      }
    }, 600);
  }
}