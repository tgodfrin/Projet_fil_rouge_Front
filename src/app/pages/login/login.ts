import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
  private authService = inject(AuthService);

  showPassword  = signal(false);
  errorMessage  = signal<string | null>(null);
  loading       = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Credentials qui correspondent exactement aux utilisateurs insérés dans data.sql
  // IDs correspondant à l'ordre d'insertion dans data.sql (ddl-auto=create → séquence stable)
  private mockUsers = [
    { id: 1,  email: 'jean.martin@mns.fr',   password: 'admin123', role: 'GESTIONNAIRE'  as const, name: 'Jean',    lastname: 'Martin'  },
    { id: 2,  email: 'sophie.leblanc@mns.fr', password: 'admin123', role: 'GESTIONNAIRE'  as const, name: 'Sophie',  lastname: 'Leblanc' },
    { id: 3,  email: 'thomas.dupont@mns.fr',  password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Thomas',  lastname: 'Dupont'  },
    { id: 4,  email: 'marie.leroy@mns.fr',    password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Marie',   lastname: 'Leroy'   },
    { id: 5,  email: 'lucas.bernard@mns.fr',  password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Lucas',   lastname: 'Bernard' },
    { id: 6,  email: 'emma.petit@mns.fr',     password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Emma',    lastname: 'Petit'   },
    { id: 7,  email: 'nathan.durand@mns.fr',  password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Nathan',  lastname: 'Durand'  },
    { id: 8,  email: 'pierre.moreau@mns.fr',  password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Pierre',  lastname: 'Moreau'  },
    { id: 9,  email: 'laura.simon@mns.fr',    password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Laura',   lastname: 'Simon'   },
    { id: 10, email: 'hugo.michel@mns.fr',    password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Hugo',    lastname: 'Michel'  },
    { id: 11, email: 'camille.robert@mns.fr', password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Camille', lastname: 'Robert'  },
    { id: 12, email: 'alexis.laurent@mns.fr', password: 'user123',  role: 'COLLABORATEUR' as const, name: 'Alexis',  lastname: 'Laurent' },
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

      this.authService.setUser({ id: user.id, name: user.name, lastname: user.lastname, role: user.role });
      this.loading.set(false);

      if (user.role === 'GESTIONNAIRE') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/utilisateur/accueil']);
      }
    }, 600);
  }
}