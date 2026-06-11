import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipmentFamily } from '../models/equipment-family.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EquipmentFamilyService {

  private readonly http    = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<EquipmentFamily[]> {
    return this.http.get<EquipmentFamily[]>(`${this.apiUrl}/equipment-family/list`);
  }

  getById(id: number): Observable<EquipmentFamily> {
    return this.http.get<EquipmentFamily>(`${this.apiUrl}/equipment-family/${id}`);
  }

  create(data: Omit<EquipmentFamily, 'id'>): Observable<EquipmentFamily> {
    return this.http.post<EquipmentFamily>(`${this.apiUrl}/equipment-family`, data);
  }

  update(id: number, data: Omit<EquipmentFamily, 'id'>): Observable<EquipmentFamily> {
    return this.http.put<EquipmentFamily>(`${this.apiUrl}/equipment-family/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/equipment-family/${id}`);
  }

  // Définit quels profils peuvent emprunter cette famille.
  setProfils(id: number, profilIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/equipment-family/${id}/profils`, { profilIds });
  }
}
