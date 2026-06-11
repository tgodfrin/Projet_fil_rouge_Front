import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Characteristic } from '../models/characteristic-value.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CharacteristicService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<Characteristic[]> {
    return this.http.get<Characteristic[]>(`${this.apiUrl}/characteristic/list`);
  }
}
