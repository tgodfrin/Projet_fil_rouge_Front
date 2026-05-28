import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser, AppUserCreate } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.apiUrl}/user/list`);
  }

  getById(id: number): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.apiUrl}/user/${id}`);
  }

  // GET /user/me → retourne l'utilisateur courant depuis le SecurityContext
  getMe(): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.apiUrl}/user/me`);
  }

  create(data: AppUserCreate): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.apiUrl}/user`, data);
  }

  // GET /user/search?q= → recherche serveur par nom, prénom ou email
  search(q: string): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.apiUrl}/user/search`, { params: { q } });
  }

  // GET /user/profil/{type} → tous les utilisateurs d'un profil donné
  getByProfil(type: string): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.apiUrl}/user/profil/${type}`);
  }

  // PUT /user/:id/email?email=...
  updateEmail(id: number, email: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}/email`, null, {
      params: { email }
    });
  }

  // PUT /user/:id/password?oldPassword=...&password=...  (gestionnaire only)
  updatePassword(id: number, oldPassword: string, password: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}/password`, null, {
      params: { oldPassword, password }
    });
  }

  // PUT /user/me/password — allows collaborateurs to change their own password
  updateMyPassword(oldPassword: string, password: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/me/password`, null, {
      params: { oldPassword, password }
    });
  }

  // PUT /user/me/email — allows collaborateurs to change their own email
  updateMyEmail(email: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/me/email`, null, {
      params: { email }
    });
  }
}
