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

  // GET /equipment/catalogue → équipements filtrés par les familles autorisées du profil connecté
  getCatalogue(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/catalogue`);
  }

  // GET /equipment/catalogue/available?begin=...&end=... → dispo + filtre profil
  getCatalogueAvailable(begin: string, end: string): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/catalogue/available`, {
      params: { begin, end }
    });
  }

  // GET /equipment/list/by-date?startDate=...&endDate=... (gestionnaire — tous équipements avec statut calculé sur la période)
  // endDate est optionnel : si absent, le back utilise startDate comme date de fin (mode jour unique)
  getAllByDate(startDate: string, endDate?: string): Observable<Equipment[]> {
    const params: Record<string, string> = { startDate };
    if (endDate) params['endDate'] = endDate;
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment/list/by-date`, { params });
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
