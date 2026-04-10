import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PlanningEvent {
  id: number;
  borrowerName: string;
  equipmentName: string;
  category: string;
  startDay: number;
  endDay: number;
}

export interface PlanningRow {
  equipmentName: string;
  category: string;
  events: PlanningEvent[];
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.html',
  styleUrl: './planning.scss'
})
export class PlanningComponent {

  viewMode = signal<'SEMAINE' | 'MOIS'>('SEMAINE');
  weekOffset = signal(0);
  selectedDate = signal<string>(this.getTodayString());
  activeCategory = signal<string>('TOUS');

  categories = ['TOUS', 'PC', 'VR', 'Tablette', 'Écran', 'Périphérique'];

  today = new Date().toDateString();

  rows = signal<PlanningRow[]>([
    {
      equipmentName: 'MacBook M3',
      category: 'PC',
      events: [
        { id: 1, borrowerName: 'Marc D.', equipmentName: 'MacBook M3', category: 'PC', startDay: 0, endDay: 1 }
      ]
    },
    {
      equipmentName: 'HP EliteBook',
      category: 'PC',
      events: [
        { id: 2, borrowerName: 'Tom V.', equipmentName: 'HP EliteBook', category: 'PC', startDay: 2, endDay: 4 }
      ]
    },
    {
      equipmentName: 'Meta Quest 3',
      category: 'VR',
      events: [
        { id: 3, borrowerName: 'Kevin L.', equipmentName: 'Meta Quest 3', category: 'VR', startDay: 1, endDay: 3 }
      ]
    },
    {
      equipmentName: 'iPad Pro 12.9"',
      category: 'Tablette',
      events: [
        { id: 4, borrowerName: 'Sophie R.', equipmentName: 'iPad Pro 12.9"', category: 'Tablette', startDay: 2, endDay: 5 }
      ]
    },
    {
      equipmentName: 'Dell UltraSharp 27"',
      category: 'Écran',
      events: [
        { id: 5, borrowerName: 'Julie F.', equipmentName: 'Dell UltraSharp 27"', category: 'Écran', startDay: 0, endDay: 0 }
      ]
    },
    {
      equipmentName: 'Clavier Keychron K2',
      category: 'Périphérique',
      events: [
        { id: 6, borrowerName: 'Alice M.', equipmentName: 'Clavier Keychron K2', category: 'Périphérique', startDay: 4, endDay: 6 }
      ]
    }
  ]);

  // ── Semaine ───────────────────────────────────────────

  weekDays = computed(() => {
    const base = new Date(this.selectedDate());
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7) + this.weekOffset() * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        index: i,
        label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        date: d,
        isToday: d.toDateString() === new Date().toDateString()
      };
    });
  });

  weekLabel = computed(() => {
    const days = this.weekDays();
    const weekNum = this.getWeekNumber(days[0].date);
    return `Semaine ${weekNum}`;
  });

  // ── Mois ──────────────────────────────────────────────

  monthDays = computed(() => {
    const base = new Date(this.selectedDate());
    base.setDate(base.getDate() + this.weekOffset() * 7);
    const year = base.getFullYear();
    const month = base.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Remplir les cases vides avant le 1er
    const startPad = (firstDay.getDay() + 6) % 7;
    const days: { date: Date | null; dayNum: number | null }[] = [];

    for (let i = 0; i < startPad; i++) days.push({ date: null, dayNum: null });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), dayNum: d });
    }
    return days;
  });

  monthLabel = computed(() => {
    const base = new Date(this.selectedDate());
    base.setDate(base.getDate() + this.weekOffset() * 7);
    return base.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  // Emprunts du mois pour un jour donné
  getMonthDayEvents(date: Date): PlanningEvent[] {
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    return this.filteredRows().flatMap(r =>
      r.events.filter(e => e.startDay <= dayIndex && e.endDay >= dayIndex)
    );
  }

  // ── Filtres ───────────────────────────────────────────

  filteredRows = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'TOUS') return this.rows();
    return this.rows().filter(r => r.category === cat);
  });

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  // ── Navigation ────────────────────────────────────────

  prevWeek(): void { this.weekOffset.update(v => v - 1); }
  nextWeek(): void { this.weekOffset.update(v => v + 1); }

  onDateChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.selectedDate.set(value);
  this.weekOffset.set(0);
}

  setViewMode(mode: 'SEMAINE' | 'MOIS'): void {
    this.viewMode.set(mode);
    this.weekOffset.set(0);
  }

  // ── Utilitaires ───────────────────────────────────────

  getEventAt(row: PlanningRow, dayIndex: number): PlanningEvent | null {
    return row.events.find(e => e.startDay === dayIndex) ?? null;
  }

  isCovered(row: PlanningRow, dayIndex: number): boolean {
    return row.events.some(e => dayIndex > e.startDay && dayIndex <= e.endDay);
  }

  getSpan(event: PlanningEvent): number {
    return event.endDay - event.startDay + 1;
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}