import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, LoanCreate } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getAll(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/list`);
  }

  getById(id: number): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/loan/${id}`);
  }

  getByUser(userId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/user/${userId}`);
  }

  // GET /loan/planning?begin=YYYY-MM-DD&end=YYYY-MM-DD
  getPlanning(begin: string, end: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/planning`, {
      params: { begin, end }
    });
  }

  // GET /loan/equipment/{id} → historique des emprunts d'un équipement
  getByEquipment(equipmentId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/equipment/${equipmentId}`);
  }

  // GET /loan/overdue → emprunts en retard (VALID dont endDate est dépassée)
  getOverdue(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/overdue`);
  }

  // GET /loan/pending → demandes en attente de validation (IN_PROGRESS)
  getPending(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/pending`);
  }

  create(data: LoanCreate): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loan`, data);
  }

  // PUT /loan/:id/validate?validatorId=X  →  IN_PROGRESS → VALID
  validate(id: number, validatorId: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}/validate`, null, {
      params: { validatorId: String(validatorId) }
    });
  }

  // PUT /loan/:id/invalidate  →  IN_PROGRESS → INVALID
  invalidate(id: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}/invalidate`, null);
  }

  // PUT /loan/:id/return  →  VALID → TERMINE
  return(id: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}/return`, null);
  }
}
