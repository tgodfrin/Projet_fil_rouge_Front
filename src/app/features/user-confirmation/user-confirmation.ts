import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './user-confirmation.html',
  styleUrl: './user-confirmation.scss'
})
export class UserConfirmationComponent {
  private router = inject(Router);

  goToLoans(): void {
    this.router.navigate(['/utilisateur/mes-emprunts']);
  }

  goToHome(): void {
    this.router.navigate(['/utilisateur/accueil']);
  }
}