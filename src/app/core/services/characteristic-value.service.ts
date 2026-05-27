import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CharacteristicValue, CharacteristicValueCreate } from '../models/characteristic-value.model';

@Injectable({ providedIn: 'root' })
export class CharacteristicValueService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getByEquipment(equipmentId: number): Observable<CharacteristicValue[]> {
    return this.http.get<CharacteristicValue[]>(
      `${this.apiUrl}/characteristic-value/equipment/${equipmentId}`
    );
  }

  create(data: CharacteristicValueCreate): Observable<CharacteristicValue> {
    return this.http.post<CharacteristicValue>(`${this.apiUrl}/characteristic-value`, data);
  }

  update(id: number, data: CharacteristicValueCreate): Observable<CharacteristicValue> {
    return this.http.put<CharacteristicValue>(`${this.apiUrl}/characteristic-value/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/characteristic-value/${id}`);
  }
}
