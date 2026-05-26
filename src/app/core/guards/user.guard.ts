import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const USER_ROLES = ['COLLABORATEUR', 'INTERVENANT', 'STAGIAIRE'];

// Vérifie que l'utilisateur est COLLABORATEUR/INTERVENANT/STAGIAIRE → sinon redirige vers /dashboard
export const userGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const role   = auth.currentUser()?.role;
  if (role && USER_ROLES.includes(role)) return true;
  return router.createUrlTree(['/dashboard']);
};
