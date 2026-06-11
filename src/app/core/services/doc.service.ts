import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doc, DocCreate } from '../models/doc.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getByEquipment(equipmentId: number): Observable<Doc[]> {
    return this.http.get<Doc[]>(`${this.apiUrl}/doc/equipment/${equipmentId}`);
  }

  create(data: DocCreate): Observable<Doc> {
    return this.http.post<Doc>(`${this.apiUrl}/doc`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/doc/${id}`);
  }
}
