import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipmentFamily } from '../models/equipment-family.model';

@Injectable({ providedIn: 'root' })
export class EquipmentFamilyService {

  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = 'http://localhost:8080';

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
}
