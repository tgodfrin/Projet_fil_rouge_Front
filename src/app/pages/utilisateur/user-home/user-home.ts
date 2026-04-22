import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserLoan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-home.html',
  styleUrl: './user-home.scss'
})
export class UserHomeComponent {
  user = { firstName: 'Julie', lastName: 'Fontaine', initials: 'JF' };

  activeLoans = signal<UserLoan[]>([
    {
      id: 1,
      equipmentName: 'MacBook Pro M3',
      category: 'PC',
      startDate: '2026-04-10',
      endDate: '2026-04-17',
      status: 'VALID'
    },
    {
      id: 2,
      equipmentName: 'Pc Asus ROG',
      category: 'PC',
      startDate: '2026-04-03',
      endDate: '2026-04-30',
      status: 'VALID'
    }
  ]);

  pendingCount = signal(1);

  returnSoonLoan = computed(() =>
    this.activeLoans().find(l => this.getDaysLeft(l) <= 1) ?? null
  );

  getDaysLeft(loan: UserLoan): number {
    const end = new Date(loan.endDate).getTime();
    return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
  }

  getProgressPercent(loan: UserLoan): number {
    const start = new Date(loan.startDate).getTime();
    const end = new Date(loan.endDate).getTime();
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100)));
  }

  formatDateRange(startDate: string, endDate: string): string {
    const s = new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const e = new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} au ${e}`;
  }
}