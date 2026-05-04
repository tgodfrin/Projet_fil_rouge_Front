import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profil } from '../models/profil.model';

@Injectable({ providedIn: 'root' })
export class ProfilService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getAll(): Observable<Profil[]> {
    return this.http.get<Profil[]>(`${this.apiUrl}/profil/list`);
  }
}
