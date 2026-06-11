import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventType } from '../models/event.model';
import { environment } from '../../../environments/environment';

// Corps attendu par POST /event ; loanId correspond au champ attendu côté back.
export interface EventCreate {
  type: EventType;
  description: string | null;
  requestedDate?: string | null; // date demandée pour un retour anticipé ou une prolongation
  loanId: number;
}

@Injectable({ providedIn: 'root' })
export class EventService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getByLoan(loanId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/loan/${loanId}`);
  }

  // Tous les événements, lus et non lus.
  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/list`);
  }

  // Notifications non lues.
  getUnread(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/unread`);
  }

  // Retours anticipés et prolongations de l'utilisateur connecté.
  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/user`);
  }

  create(data: EventCreate): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/event`, data);
  }

  // Marque un événement comme lu.
  markAsRead(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/read`, null);
  }

  // Le gestionnaire accepte la demande ; côté back, la date de fin de l'emprunt est mise à jour.
  accept(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/accept`, null);
  }

  // Le gestionnaire refuse la demande ; le refus est tracé.
  refuse(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/refuse`, null);
  }
}
