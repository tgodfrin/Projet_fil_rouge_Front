import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription, distinctUntilChanged, switchMap, Subject } from 'rxjs';

import { LoanService } from '../../../core/services/loan.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { Loan } from '../../../core/models/loan.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';
import { PlanningEvent, PlanningRow } from '../../../core/models/planning.model';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.html',
  styleUrl: './planning.scss'
})
export class PlanningComponent implements OnInit, OnDestroy {

  private loanService   = inject(LoanService);
  private familyService = inject(EquipmentFamilyService);

  private families = toSignal(this.familyService.getAll(), { initialValue: [] as EquipmentFamily[] });

  // Loans chargés depuis le back pour la période visible — rerechargés à chaque navigation
  loans   = signal<Loan[]>([]);
  loading = signal(true);

  viewMode       = signal<'SEMAINE' | 'MOIS'>('SEMAINE');
  weekOffset     = signal(0);  // utilisé en mode SEMAINE (unité = 7 jours)
  monthOffset    = signal(0);  // utilisé en mode MOIS (unité = 1 mois calendaire)
  selectedDate   = signal<string>(this.getTodayString());
  activeCategory = signal<string>('Tous');

  today = new Date().toDateString();

  // Subject qui émet le range {begin, end} à chaque changement de vue
  private rangeSubject = new Subject<{ begin: string; end: string }>();
  private sub!: Subscription;

  // Catégories dynamiques depuis les vraies familles
  categories = computed(() => ['Tous', ...this.families().map(f => f.nameEquipmentFamily)]);

  private familyName(id: number): string {
    return this.families().find(f => f.id === id)?.nameEquipmentFamily ?? '—';
  }

  ngOnInit(): void {
    // switchMap annule le précédent appel si la vue change avant la réponse
    this.sub = this.rangeSubject.pipe(
      distinctUntilChanged((a, b) => a.begin === b.begin && a.end === b.end),
      switchMap(({ begin, end }) => this.loanService.getPlanning(begin, end))
    ).subscribe({
      next:  (data) => { this.loans.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });

    // Chargement initial
    this.loadCurrentRange();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // Calcule le range de la vue courante et l'émet vers le Subject
  private loadCurrentRange(): void {
    const range = this.getVisibleRange();
    this.rangeSubject.next(range);
  }

  // Retourne begin/end au format LocalDate (YYYY-MM-DD) selon la vue active
  private getVisibleRange(): { begin: string; end: string } {
    if (this.viewMode() === 'SEMAINE') {
      const days = this.weekDays();
      return {
        begin: this.toDateStr(days[0].date),
        end:   this.toDateStr(days[6].date),
      };
    } else {
      // Vue MOIS : 1er et dernier jour du mois affiché (via monthBase)
      const base  = this.monthBase();
      const year  = base.getFullYear();
      const month = base.getMonth();
      const first = new Date(year, month, 1);
      const last  = new Date(year, month + 1, 0);
      return {
        begin: this.toDateStr(first),
        end:   this.toDateStr(last),
      };
    }
  }

  // Emprunts regroupés par équipement pour construire les lignes du planning.
  // Le back renvoie déjà uniquement les loans de la période — pas besoin de filtrer par statut
  rows = computed((): PlanningRow[] => {
    const byEquipment = new Map<string, PlanningRow>();

    this.loans().forEach(loan => {
      const key      = loan.equipment.equipmentName;
      const category = this.familyName(loan.equipment.equipmentFamily.id);

      if (!byEquipment.has(key)) {
        byEquipment.set(key, { equipmentName: key, category, events: [] });
      }

      const event: PlanningEvent = {
        id:            loan.id,
        borrowerName:  `${loan.requester.name} ${loan.requester.lastname[0]}.`,
        equipmentName: key,
        category,
        startDate:     loan.beginDate.substring(0, 10),
        endDate:       loan.endDate.substring(0, 10),
      };
      byEquipment.get(key)!.events.push(event);
    });

    return Array.from(byEquipment.values());
  });

  // Semaine

  weekDays = computed(() => {
    const base   = new Date(this.selectedDate());
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7) + this.weekOffset() * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        index:   i,
        label:   d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        date:    d,
        isToday: d.toDateString() === new Date().toDateString()
      };
    });
  });

  weekLabel = computed(() => {
    const days = this.weekDays();
    return `Semaine ${this.getWeekNumber(days[0].date)}`;
  });

  // Mois

  // Base calendaire du mois affiché : on part de selectedDate et on ajoute monthOffset mois
  private monthBase = computed(() => {
    const base = new Date(this.selectedDate());
    base.setMonth(base.getMonth() + this.monthOffset());
    return base;
  });

  monthDays = computed(() => {
    const base  = this.monthBase();
    const year  = base.getFullYear();
    const month = base.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;

    const days: { date: Date | null; dayNum: number | null }[] = [];
    for (let i = 0; i < startPad; i++) days.push({ date: null, dayNum: null });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), dayNum: d });
    }
    return days;
  });

  monthLabel = computed(() =>
    this.monthBase().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  );

  getMonthDayEvents(date: Date): PlanningEvent[] {
    const dateStr = this.toDateStr(date);
    return this.filteredRows().flatMap(r =>
      r.events.filter(e => dateStr >= e.startDate && dateStr <= e.endDate)
    );
  }

  // Filtres

  filteredRows = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'Tous') return this.rows();
    return this.rows().filter(r => r.category === cat);
  });

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  // Navigation — chaque action recharge les données du back

  prevWeek(): void {
    if (this.viewMode() === 'MOIS') {
      this.monthOffset.update(v => v - 1);
    } else {
      this.weekOffset.update(v => v - 1);
    }
    this.loadCurrentRange();
  }

  nextWeek(): void {
    if (this.viewMode() === 'MOIS') {
      this.monthOffset.update(v => v + 1);
    } else {
      this.weekOffset.update(v => v + 1);
    }
    this.loadCurrentRange();
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectedDate.set(value);
    this.weekOffset.set(0);
    this.monthOffset.set(0);
    this.loadCurrentRange();
  }

  setViewMode(mode: 'SEMAINE' | 'MOIS'): void {
    this.viewMode.set(mode);
    this.weekOffset.set(0);
    this.monthOffset.set(0);
    this.loadCurrentRange();
  }

  // Utilitaires

  getEventAt(row: PlanningRow, date: Date): PlanningEvent | null {
    const dateStr = this.toDateStr(date);
    return row.events.find(e => e.startDate === dateStr) ?? null;
  }

  isCovered(row: PlanningRow, date: Date): boolean {
    const dateStr = this.toDateStr(date);
    return row.events.some(e => dateStr > e.startDate && dateStr <= e.endDate);
  }

  getSpan(event: PlanningEvent, fromDate: Date): number {
    const [ey, em, ed] = event.endDate.split('-').map(Number);
    const endDate = new Date(ey, em - 1, ed);

    const dayIndex   = (fromDate.getDay() + 6) % 7;
    const weekEndDate = new Date(fromDate);
    weekEndDate.setDate(fromDate.getDate() + (6 - dayIndex));

    const effectiveEnd = endDate <= weekEndDate ? endDate : weekEndDate;
    const diffDays = Math.round((effectiveEnd.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  }

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
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
