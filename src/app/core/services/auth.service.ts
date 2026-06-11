import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';

export interface AuthUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
}

const TOKEN_KEY = 'loc_mns_token';
const USER_KEY  = 'loc_mns_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private _currentUser = signal<AuthUser | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  );
  private _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly currentUser = this._currentUser.asReadonly();

  readonly initials = computed(() => {
    const u = this._currentUser();
    if (!u) return '?';
    return (u.name[0] + u.lastname[0]).toUpperCase();
  });

  readonly fullName = computed(() => {
    const u = this._currentUser();
    if (!u) return '';
    return `${u.name} ${u.lastname}`;
  });

  readonly roleLabel = computed(() => {
    const u = this._currentUser();
    if (!u) return '';
    const labels: Record<UserRole, string> = {
      GESTIONNAIRE:  'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT:   'Intervenant',
      STAGIAIRE:     'Stagiaire'
    };
    return labels[u.role];
  });

  setSession(token: string, user: AuthUser): void {
    // On met à jour les signaux d'abord pour que les valeurs calculées (fullName, initials) soient prêtes avant la navigation.
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return this._token();
  }

  isLoggedIn(): boolean {
    return this._token() !== null && this._currentUser() !== null;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/forgot-password`, { email });
  }
}
