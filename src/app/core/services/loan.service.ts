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

  // PUT /loan/:id/validate  →  IN_PROGRESS → VALID
  // Le validatorId est lu depuis le token JWT côté back — aucun paramètre à envoyer
  validate(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/${id}/validate`, null);
  }

  // PUT /loan/:id/invalidate  →  IN_PROGRESS → INVALID
  // Le back retourne 204 NO_CONTENT → Observable<void>
  invalidate(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/${id}/invalidate`, null);
  }

  // PUT /loan/:id/return  →  VALID → TERMINE
  // Le back retourne 204 NO_CONTENT → Observable<void>
  return(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/${id}/return`, null);
  }

  // PUT /loan/:id/extend  →  updates endDate (user-initiated, checks requester ownership)
  extendLoan(loanId: number, newEndDate: string): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${loanId}/extend`, { newEndDate });
  }

  // PUT /loan/:id/validate-extension  →  gestionnaire validates an extension request
  // No requester check — works for overdue loans too
  validateExtension(loanId: number, newEndDate: string): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${loanId}/validate-extension`, { newEndDate });
  }

  // PUT /loan/:id/validate-early-return  →  gestionnaire validates early return request
  // Updates endDate to the requested date — loan stays VALID until physically returned
  validateEarlyReturn(loanId: number, newEndDate: string): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${loanId}/validate-early-return`, { newEndDate });
  }

  // PUT /loan/:id/return  →  VALID → TERMINE (explicit alias for readability)
  returnLoan(id: number): Observable<void> {
    return this.return(id);
  }

  // PUT /loan/group/:groupId/validate  →  validates all loans in the group at once
  validateGroup(groupId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/group/${groupId}/validate`, null);
  }

  // PUT /loan/group/:groupId/refuse  →  refuses all loans in the group at once
  refuseGroup(groupId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/group/${groupId}/refuse`, null);
  }
}
