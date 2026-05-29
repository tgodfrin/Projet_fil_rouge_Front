import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { Equipment } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';

@Component({
  selector: 'app-user-catalogue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-catalogue.html',
  styleUrl: './user-catalogue.scss'
})
export class UserCatalogueComponent implements OnInit {
  private router           = inject(Router);
  private equipmentService = inject(EquipmentService);
  private familyService    = inject(EquipmentFamilyService);

  private families = toSignal(this.familyService.getAll(), { initialValue: [] as EquipmentFamily[] });

  // Listes chargées depuis l'API
  private allEquipments       = signal<Equipment[]>([]);  // tous les équipements (mode sans dates)
  private availableEquipments = signal<Equipment[]>([]);  // filtrés par période (mode avec dates)

  // État UI
  startDate      = signal('');
  endDate        = signal('');
  searchTerm     = signal('');
  activeCategory = signal<string>('Tous');
  selectedIds    = signal<number[]>([]);

  // Catégories dynamiques depuis les vraies familles
  categories = computed(() => ['Tous', ...this.families().map(f => f.nameEquipmentFamily)]);

  // Les deux dates sont saisies et la période est valide (fin > début)
  datesSet = computed(() => {
    const s = this.startDate();
    const e = this.endDate();
    return !!s && !!e && new Date(e) > new Date(s);
  });

  duration = computed(() => {
    if (!this.datesSet()) return 0;
    const diff = new Date(this.endDate()).getTime() - new Date(this.startDate()).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  // Sans dates : équipements DISPONIBLE actuellement
  // Avec dates : équipements disponibles sur la période choisie
  private baseList = computed(() =>
    this.datesSet()
      ? this.availableEquipments()
      : this.allEquipments().filter(e => e.status === 'DISPONIBLE')
  );

  // Liste affichée : baseList filtrée par recherche + catégorie (client-side)
  equipments = computed(() => {
    let list = this.baseList();
    const q = this.searchTerm().trim().toLowerCase();
    if (q) {
      list = list.filter(e => e.equipmentName.toLowerCase().includes(q));
    }
    const cat = this.activeCategory();
    if (cat !== 'Tous') {
      list = list.filter(e => e.equipmentFamily.nameEquipmentFamily === cat);
    }
    return list;
  });

  canSubmit = computed(() => this.selectedIds().length > 0 && this.datesSet());

  ngOnInit(): void {
    this.equipmentService.getAll().subscribe(data => this.allEquipments.set(data));
  }

  onStartDate(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
    this.selectedIds.set([]);
    this.loadAvailableIfReady();
  }

  onEndDate(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
    this.selectedIds.set([]);
    this.loadAvailableIfReady();
  }

  // Appelle getAvailable() uniquement si les deux dates forment une période valide
  private loadAvailableIfReady(): void {
    const s = this.startDate();
    const e = this.endDate();
    if (s && e && new Date(e) > new Date(s)) {
      this.equipmentService.getAvailable(`${s}T08:00:00`, `${e}T18:00:00`)
        .subscribe(data => this.availableEquipments.set(data));
    }
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  toggleSelect(item: Equipment): void {
    this.selectedIds.update(ids =>
      ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]
    );
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  // Navigue vers la page de récapitulatif en passant les données via navigation state
  goToSummary(): void {
    if (!this.canSubmit()) return;
    this.router.navigate(['/utilisateur/recapitulatif'], {
      state: {
        equipmentIds: this.selectedIds(),
        beginDate:    `${this.startDate()}T08:00:00`,
        endDate:      `${this.endDate()}T18:00:00`,
      }
    });
  }

  getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  getCategoryIcon(familyName: string): string {
    const icons: Record<string, string> = {
      'PC':              '💻',
      'Écran':           '🖥️',
      'Casque VR':       '🥽',
      'Vidéoprojecteur': '📽️',
      'Périphérique':    '🖱️',
      'Autre':           '📦',
    };
    return icons[familyName] ?? '📦';
  }
}
