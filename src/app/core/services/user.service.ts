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

  create(data: AppUserCreate): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.apiUrl}/user`, data);
  }

  // PUT /user/:id/email?email=...
  updateEmail(id: number, email: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}/email`, null, {
      params: { email }
    });
  }

  // PUT /user/:id/password?password=...
  updatePassword(id: number, password: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/user/${id}/password`, null, {
      params: { password }
    });
  }
}
