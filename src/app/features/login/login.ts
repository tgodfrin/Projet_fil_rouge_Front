import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  private mockUsers = [
    { email: 'admin@mns.fr',  password: 'admin123', role: 'GESTIONNAIRE' },
    { email: 'julie@mns.fr',  password: 'user123',  role: 'COLLABORATEUR' },
  ];

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  submit() {
    this.errorMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      const user = this.mockUsers.find(
        u => u.email === this.email && u.password === this.password
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

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.submit();
  }
}