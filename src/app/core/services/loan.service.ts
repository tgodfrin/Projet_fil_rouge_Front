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

  create(data: LoanCreate): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loan`, data);
  }

  // PUT /loan/:id/validate?validatorId=X  →  VALID → IN_PROGRESS
  validate(id: number, validatorId: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}/validate`, null, {
      params: { validatorId: String(validatorId) }
    });
  }

  // PUT /loan/:id/invalidate  →  VALID → INVALID
  invalidate(id: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}/invalidate`, null);
  }

  // PUT /loan/:id/return  →  IN_PROGRESS → TERMINE
  return(id: number): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}/return`, null);
  }
}
