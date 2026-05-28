import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ne pas ajouter le header sur /login (pas encore de token à ce stade)
  // N'injecter le token que si la requête n'a pas déjà un header Authorization
  if (token && !req.url.endsWith('/login') && !req.headers.has('Authorization')) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
