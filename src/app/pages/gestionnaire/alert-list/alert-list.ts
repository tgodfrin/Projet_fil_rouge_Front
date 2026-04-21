import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type AlertType = 'RETARD' | 'PANNE';

export interface Alert {
  id: number;
  loanId: number;
  type: AlertType;
  equipmentName: string;
  borrowerName: string;
  description: string;
  date: string;
  read: boolean;
}

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.scss'
})
export class AlertListComponent {

  constructor(private router: Router) {}

  activeTab = signal<'TOUTES' | AlertType>('TOUTES');

  alerts = signal<Alert[]>([
    { id: 1, loanId: 3, type: 'RETARD',   equipmentName: 'MacBook Pro M3',    borrowerName: 'Marc Durand',   description: 'Retard de 3 jours',              date: '2026-03-04', read: false },
    { id: 2, loanId: 4, type: 'PANNE',   equipmentName: 'iPad Pro 12.9"',    borrowerName: 'Sophie Renard', description: 'Dégradation écran signalée',     date: '2026-03-05', read: false },
    { id: 3, loanId: 5, type: 'RETARD',  equipmentName: 'Dell UltraSharp 27"',borrowerName: 'Tom Vasseur',  description: 'Retard de 1 jour',               date: '2026-03-06', read: false },
    { id: 4, loanId: 2, type: 'PANNE',   equipmentName: 'Meta Quest 3',      borrowerName: 'Kevin Leclerc', description: 'Manette droite défectueuse',     date: '2026-03-07', read: true  },
    { id: 5, loanId: 1, type: 'RETARD',   equipmentName: 'HP EliteBook 840',  borrowerName: 'Julie Fontaine',description: 'Retard de 2 jours',              date: '2026-03-07', read: true  },
  ]);

  filteredAlerts = computed(() => {
    const tab = this.activeTab();
    if (tab === 'TOUTES') return this.alerts();
    return this.alerts().filter(a => a.type === tab);
  });

  countByType(type: AlertType | 'TOUTES'): number {
    if (type === 'TOUTES') return this.alerts().length;
    return this.alerts().filter(a => a.type === type).length;
  }

  unreadCount(): number {
    return this.alerts().filter(a => !a.read).length;
  }

  retardCount(): number {
    return this.alerts().filter(a => a.type === 'RETARD').length;
  }

  panneCount(): number {
    return this.alerts().filter(a => a.type === 'PANNE').length;
  }

  setTab(tab: 'TOUTES' | AlertType): void {
    this.activeTab.set(tab);
  }

  markAsRead(alert: Alert): void {
    this.alerts.update(list =>
      list.map(a => a.id === alert.id ? { ...a, read: true } : a)
    );
  }

  markAllAsRead(): void {
    this.alerts.update(list => list.map(a => ({ ...a, read: true })));
  }

  voirEmprunt(alert: Alert): void {
    this.markAsRead(alert);
    this.router.navigate(['/emprunts', alert.loanId]);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}