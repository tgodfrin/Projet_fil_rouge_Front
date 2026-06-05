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

  // PUT /user/:id/email — email envoyé dans le corps JSON (plus en paramètre d'URL)
  updateEmail(id: number, email: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}/email`, { email });
  }

  // PUT /user/:id/password — identifiants dans le corps JSON (gestionnaire only)
  updatePassword(id: number, oldPassword: string, password: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}/password`, { oldPassword, password });
  }

  // PUT /user/me/password — identifiants dans le corps JSON (utilisateur change son propre mot de passe)
  updateMyPassword(oldPassword: string, password: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/me/password`, { oldPassword, password });
  }

  // PUT /user/me/email — email dans le corps JSON (utilisateur change son propre email)
  updateMyEmail(email: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/me/email`, { email });
  }

  // PUT /user/:id — update name/lastname/email/profil (gestionnaire only, no password)
  update(id: number, data: { name: string; lastname: string; email: string; profilId: number }): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}`, data);
  }

  // DELETE /user/:id — gestionnaire only
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/${id}`);
  }
}
