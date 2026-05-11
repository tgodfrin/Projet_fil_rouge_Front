import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { Equipment, EquipmentStatus } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';

@Component({
  selector: 'app-user-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-catalogue.html',
  styleUrl: './user-catalogue.scss'
})
export class UserCatalogueComponent {
  private router           = inject(Router);
  private equipmentService = inject(EquipmentService);
  private familyService    = inject(EquipmentFamilyService);

  private equipments = toSignal(this.equipmentService.getAll(), { initialValue: [] as Equipment[]      });
  private families   = toSignal(this.familyService.getAll(),    { initialValue: [] as EquipmentFamily[] });

  searchTerm     = signal('');
  activeCategory = signal<string>('Tous');

  // Mode multi-sélection
  multiMode      = signal(false);
  multiStartDate = signal('');
  multiEndDate   = signal('');
  selectedIds    = signal<number[]>([]);

  // Catégories dynamiques depuis les vraies familles
  categories = computed(() => ['Tous', ...this.families().map(f => f.nameEquipmentFamily)]);

  filteredItems = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const cat    = this.activeCategory();
    return this.equipments().filter(item => {
      const matchCat    = cat === 'Tous' || item.equipmentFamily.nameEquipmentFamily === cat;
      const matchSearch = item.equipmentName.toLowerCase().includes(search) ||
                          item.reference.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });
  });

  duration = computed(() => {
    if (!this.multiStartDate() || !this.multiEndDate()) return 0;
    const diff = new Date(this.multiEndDate()).getTime() - new Date(this.multiStartDate()).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  canMultiSubmit = computed(() =>
    this.selectedIds().length > 0 &&
    this.multiStartDate() !== '' &&
    this.multiEndDate() !== '' &&
    this.duration() > 0
  );

  toggleMultiMode(): void {
    this.multiMode.update(v => !v);
    this.selectedIds.set([]);
    this.multiStartDate.set('');
    this.multiEndDate.set('');
  }

  toggleSelect(item: Equipment): void {
    if (item.status !== 'DISPONIBLE') return;
    this.selectedIds.update(ids =>
      ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]
    );
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  onStartDate(event: Event): void {
    this.multiStartDate.set((event.target as HTMLInputElement).value);
  }

  onEndDate(event: Event): void {
    this.multiEndDate.set((event.target as HTMLInputElement).value);
  }

  submitMulti(): void {
    this.router.navigate(['/utilisateur/confirmation']);
  }

  getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getCategoryIcon(familyName: string): string {
    const icons: Record<string, string> = {
      'PC': '💻', 'VR': '🥽', 'Tablette': '📱', 'Écran': '🖥️', 'Périphérique': '🖱️',
      'Informatique': '💻', 'Audio': '🎧', 'Réseau': '🌐',
    };
    return icons[familyName] ?? '📦';
  }

  getStatusLabel(status: EquipmentStatus | null): string {
    if (!status) return '—';
    const labels: Record<EquipmentStatus, string> = {
      DISPONIBLE: 'Dispo', EN_PRET: 'En prêt', OUT_OF_SERVICE: 'H.S.', UNDER_REPAIR: 'Réparation'
    };
    return labels[status];
  }

  getStatusClass(status: EquipmentStatus | null): string {
    if (!status) return '';
    const classes: Record<EquipmentStatus, string> = {
      DISPONIBLE: 'badge-success', EN_PRET: 'badge-warning', OUT_OF_SERVICE: 'badge-danger', UNDER_REPAIR: 'badge-danger'
    };
    return classes[status];
  }

  goToDetail(id: number): void {
    this.router.navigate(['/utilisateur/catalogue', id]);
  }
}