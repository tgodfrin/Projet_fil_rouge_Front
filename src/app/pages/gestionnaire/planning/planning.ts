import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningEvent, PlanningRow } from '../../../core/models/planning.model';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
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
        { id: 1, borrowerName: 'Marc D.', equipmentName: 'MacBook M3', category: 'PC', startDate: '2026-04-14', endDate: '2026-04-15' }
      ]
    },
    {
      equipmentName: 'HP EliteBook',
      category: 'PC',
      events: [
        { id: 2, borrowerName: 'Tom V.', equipmentName: 'HP EliteBook', category: 'PC', startDate: '2026-04-16', endDate: '2026-04-18' }
      ]
    },
    {
      equipmentName: 'Meta Quest 3',
      category: 'VR',
      events: [
        { id: 3, borrowerName: 'Kevin L.', equipmentName: 'Meta Quest 3', category: 'VR', startDate: '2026-04-15', endDate: '2026-04-17' }
      ]
    },
    {
      equipmentName: 'iPad Pro 12.9"',
      category: 'Tablette',
      events: [
        { id: 4, borrowerName: 'Sophie R.', equipmentName: 'iPad Pro 12.9"', category: 'Tablette', startDate: '2026-04-16', endDate: '2026-04-19' }
      ]
    },
    {
      equipmentName: 'Dell UltraSharp 27"',
      category: 'Écran',
      events: [
        { id: 5, borrowerName: 'Julie F.', equipmentName: 'Dell UltraSharp 27"', category: 'Écran', startDate: '2026-04-14', endDate: '2026-04-14' }
      ]
    },
    {
      equipmentName: 'Clavier Keychron K2',
      category: 'Périphérique',
      events: [
        { id: 6, borrowerName: 'Alice M.', equipmentName: 'Clavier Keychron K2', category: 'Périphérique', startDate: '2026-04-18', endDate: '2026-04-20' }
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

  getMonthDayEvents(date: Date): PlanningEvent[] {
    const dateStr = this.toDateStr(date);
    return this.filteredRows().flatMap(r =>
      r.events.filter(e => dateStr >= e.startDate && dateStr <= e.endDate)
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

  // Retourne l'event qui COMMENCE sur cette date
  getEventAt(row: PlanningRow, date: Date): PlanningEvent | null {
    const dateStr = this.toDateStr(date);
    return row.events.find(e => e.startDate === dateStr) ?? null;
  }

  // Retourne true si la date est au MILIEU ou à la FIN d'un event (pas le début)
  isCovered(row: PlanningRow, date: Date): boolean {
    const dateStr = this.toDateStr(date);
    return row.events.some(e => dateStr > e.startDate && dateStr <= e.endDate);
  }

  // Calcule le nombre de colonnes à occuper, en s'arrêtant à la fin de la semaine
  getSpan(event: PlanningEvent, fromDate: Date): number {
    const [ey, em, ed] = event.endDate.split('-').map(Number);
    const endDate = new Date(ey, em - 1, ed);

    const dayIndex = (fromDate.getDay() + 6) % 7; // 0=Lun, 6=Dim
    const weekEndDate = new Date(fromDate);
    weekEndDate.setDate(fromDate.getDate() + (6 - dayIndex));

    const effectiveEnd = endDate <= weekEndDate ? endDate : weekEndDate;
    const diffMs = effectiveEnd.getTime() - fromDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  }

  // Formate une date en 'YYYY-MM-DD' en heure locale (évite les décalages UTC)
  private toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}