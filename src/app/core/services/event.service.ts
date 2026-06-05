import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventType } from '../models/event.model';

// Body attendu par POST /event — loanId correspond au champ attendu par EventRequest.java côté back
export interface EventCreate {
  type: EventType;
  description: string | null;
  requestedDate?: string | null; // date demandée (retour anticipé / prolongation), champ dédié
  loanId: number;
}

@Injectable({ providedIn: 'root' })
export class EventService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getByLoan(loanId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/loan/${loanId}`);
  }

  // GET /event/list  →  tous les events (lus + non lus)
  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/list`);
  }

  // GET /event/unread  →  notifications non lues (readingDate IS NULL)
  getUnread(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/unread`);
  }

  // GET /event/user  →  events EARLY_RETURN et EXTENSION du user connecté
  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/user`);
  }

  create(data: EventCreate): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/event`, data);
  }

  // PUT /event/:id/read  →  readingDate = now
  markAsRead(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/read`, null);
  }

  // PUT /event/:id/accept  →  le gestionnaire accepte la demande (decisionStatus = ACCEPTED)
  // Côté back, la date de fin de l'emprunt est mise à jour avec la date demandée
  accept(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/accept`, null);
  }

  // PUT /event/:id/refuse  →  le gestionnaire refuse la demande (decisionStatus = REFUSED, tracé)
  refuse(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/refuse`, null);
  }
}
