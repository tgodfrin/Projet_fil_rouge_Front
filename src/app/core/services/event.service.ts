import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventType } from '../models/event.model';

// Body attendu par POST /event
export interface EventCreate {
  type: EventType;
  description: string | null;
  loan: { id: number };
}

@Injectable({ providedIn: 'root' })
export class EventService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  getByLoan(loanId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/loan/${loanId}`);
  }

  // GET /event/unread  →  notifications non lues (readingDate IS NULL)
  getUnread(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/event/unread`);
  }

  create(data: EventCreate): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/event`, data);
  }

  // PUT /event/:id/read  →  readingDate = now
  markAsRead(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/event/${id}/read`, null);
  }
}
