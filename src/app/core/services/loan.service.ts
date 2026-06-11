import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, LoanCreate } from '../models/loan.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoanService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

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

  // Historique des emprunts d'un équipement.
  getByEquipment(equipmentId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/equipment/${equipmentId}`);
  }

  // Emprunts en retard : validés dont la date de fin est dépassée.
  getOverdue(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/overdue`);
  }

  // Demandes en attente de validation.
  getPending(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan/pending`);
  }

  create(data: LoanCreate): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loan`, data);
  }

  // Validation d'une demande : elle passe de "en attente" à "validée".
  // Le valideur est déterminé côté back à partir du token JWT, aucun paramètre à envoyer.
  validate(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/${id}/validate`, null);
  }

  // Refus d'une demande. Le back renvoie 204 sans contenu.
  invalidate(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/${id}/invalidate`, null);
  }

  // Enregistrement du retour : l'emprunt passe à "terminé". Le back renvoie 204 sans contenu.
  return(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/${id}/return`, null);
  }

  // La validation et le refus des demandes de retour anticipé et de prolongation passent par
  // EventService.accept() et refuse(), qui tracent la décision.

  // Valide tous les emprunts d'un groupe en une fois.
  validateGroup(groupId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/group/${groupId}/validate`, null);
  }

  // Refuse tous les emprunts d'un groupe en une fois.
  refuseGroup(groupId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/loan/group/${groupId}/refuse`, null);
  }
}
