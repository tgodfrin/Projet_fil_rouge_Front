import { Injectable, signal, computed } from '@angular/core';

export interface AuthUser {
  id: number;
  name: string;
  lastname: string;
  role: 'GESTIONNAIRE' | 'COLLABORATEUR';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<AuthUser | null>(null);

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
    return u.role === 'GESTIONNAIRE' ? 'Gestionnaire' : 'Collaborateur';
  });

  setUser(user: AuthUser): void {
    this._currentUser.set(user);
  }

  clear(): void {
    this._currentUser.set(null);
  }
}
