import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../models/equipment.model';

// Body pour POST /equipment et PUT /equipment/:id
// Le champ `status` est @Transient côté back → on ne l'envoie pas
export interface EquipmentPayload {
  reference: string;
  equipmentName: string;
  location: string | null;
  acquisitionDate: string | null;
  equipmentFamilyId: number;
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getAll(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/list`);
  }

  getById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/equipment/${id}`);
  }

  // GET /equipment/available?begin=YYYY-MM-DD&end=YYYY-MM-DD
  getAvailable(begin: string, end: string): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/available`, {
      params: { begin, end }
    });
  }

  // GET /equipment/search?q= → recherche serveur par nom
  searchByName(q: string): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/search`, { params: { q } });
  }

  // GET /equipment/family/{familyId} → filtre par famille
  getByFamily(familyId: number): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/family/${familyId}`);
  }

  create(data: EquipmentPayload): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/equipment`, data);
  }

  update(id: number, data: EquipmentPayload): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/equipment/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/equipment/${id}`);
  }
}
