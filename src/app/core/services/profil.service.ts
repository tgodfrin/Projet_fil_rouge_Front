import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profil } from '../models/profil.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfilService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<Profil[]> {
    return this.http.get<Profil[]>(`${this.apiUrl}/profil/list`);
  }
}
