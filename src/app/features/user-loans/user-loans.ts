import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


export type UserLoanStatus = 'EN_COURS' | 'EN_ATTENTE' | 'TERMINE' | 'REFUSE' | 'RETARD';

export interface UserLoan {
  id: number;
  equipmentName: string;
  category: string;
  categoryIcon: string;
  startDate: string;
  endDate: string;
  status: UserLoanStatus;
}

type FilterTab = 'EN_COURS' | 'EN_ATTENTE' | 'HISTORIQUE';

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './user-loans.html',
  styleUrl: './user-loans.scss'
})
export class UserLoansComponent {
  activeTab = signal<FilterTab>('EN_COURS');

  loans = signal<UserLoan[]>([
    {
      id: 1,
      equipmentName: 'MacBook Pro M3',
      category: 'PC',
      categoryIcon: '💻',
      startDate: '2026-04-10',
      endDate: '2026-04-17',
      status: 'EN_COURS'
    },
    {
      id: 2,
      equipmentName: 'Dell UltraSharp 27"',
      category: 'Écran',
      categoryIcon: '🖥️',
      startDate: '2026-04-08',
      endDate: '2026-04-22',
      status: 'EN_COURS'
    },
    {
      id: 3,
      equipmentName: 'iPad Pro 12.9"',
      category: 'Tablette',
      categoryIcon: '📱',
      startDate: '2026-04-15',
      endDate: '2026-04-20',
      status: 'EN_ATTENTE'
    },
    {
      id: 4,
      equipmentName: 'Meta Quest 3',
      category: 'VR',
      categoryIcon: '🥽',
      startDate: '2026-03-01',
      endDate: '2026-03-10',
      status: 'TERMINE'
    },
    {
      id: 5,
      equipmentName: 'HP EliteBook 840',
      category: 'PC',
      categoryIcon: '💻',
      startDate: '2026-03-15',
      endDate: '2026-03-20',
      status: 'REFUSE'
    }
  ]);

  filteredLoans = computed(() => {
    const tab = this.activeTab();
    if (tab === 'EN_COURS')    return this.loans().filter(l => l.status === 'EN_COURS' || l.status === 'RETARD');
    if (tab === 'EN_ATTENTE')  return this.loans().filter(l => l.status === 'EN_ATTENTE');
    return this.loans().filter(l => l.status === 'TERMINE' || l.status === 'REFUSE');
  });

  countByTab(tab: FilterTab): number {
    if (tab === 'EN_COURS')   return this.loans().filter(l => l.status === 'EN_COURS' || l.status === 'RETARD').length;
    if (tab === 'EN_ATTENTE') return this.loans().filter(l => l.status === 'EN_ATTENTE').length;
    return this.loans().filter(l => l.status === 'TERMINE' || l.status === 'REFUSE').length;
  }

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  getDaysLeft(loan: UserLoan): number {
    return Math.ceil((new Date(loan.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

  getStatusLabel(status: UserLoanStatus): string {
    const labels: Record<UserLoanStatus, string> = {
      EN_COURS: 'Actif', EN_ATTENTE: 'En attente',
      TERMINE: 'Terminé', REFUSE: 'Refusé', RETARD: 'Retard'
    };
    return labels[status];
  }

  getStatusClass(status: UserLoanStatus): string {
    const classes: Record<UserLoanStatus, string> = {
      EN_COURS: 'badge-success', EN_ATTENTE: 'badge-warning',
      TERMINE: 'badge-neutral', REFUSE: 'badge-danger', RETARD: 'badge-danger'
    };
    return classes[status];
  }
}