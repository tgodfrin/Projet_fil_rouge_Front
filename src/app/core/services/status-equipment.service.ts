import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatusEquipment, StatusEquipmentCreate } from '../models/status-equipment.model';

@Injectable({ providedIn: 'root' })
export class StatusEquipmentService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getByEquipment(equipmentId: number): Observable<StatusEquipment[]> {
    return this.http.get<StatusEquipment[]>(
      `${this.apiUrl}/status-equipment/equipment/${equipmentId}`
    );
  }

  create(data: StatusEquipmentCreate): Observable<StatusEquipment> {
    return this.http.post<StatusEquipment>(`${this.apiUrl}/status-equipment`, data);
  }

  // Clôture un statut technique en renseignant sa date de fin.
  resolve(id: number): Observable<StatusEquipment> {
    return this.http.put<StatusEquipment>(
      `${this.apiUrl}/status-equipment/${id}/resolve`, null
    );
  }
}
