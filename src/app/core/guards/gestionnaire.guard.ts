import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Laisse passer si l'utilisateur est gestionnaire, sinon redirige vers l'espace utilisateur.
export const gestionnaireGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'GESTIONNAIRE') return true;
  return router.createUrlTree(['/utilisateur/accueil']);
};
