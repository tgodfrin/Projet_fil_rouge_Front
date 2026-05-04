import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EquipmentStatus } from '../../../core/models/equipment.model';
// Types locaux mock — seront remplacés lors du branchement sur EquipmentService
type EquipmentCategory = 'PC' | 'VR' | 'Tablette' | 'Écran' | 'Périphérique';
interface CatalogueItem { id: number; name: string; ref: string; category: EquipmentCategory; status: EquipmentStatus; location?: string; selected?: boolean; }

@Component({
  selector: 'app-user-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-catalogue.html',
  styleUrl: './user-catalogue.scss'
})
export class UserCatalogueComponent {
  private router = inject(Router);

  searchTerm = signal('');
  activeCategory = signal<EquipmentCategory | 'Tous'>('Tous');

  // Mode multi-sélection
  multiMode = signal(false);
  multiStartDate = signal('');
  multiEndDate = signal('');
  selectedIds = signal<number[]>([]);

  categories: (EquipmentCategory | 'Tous')[] = ['Tous', 'PC', 'VR', 'Tablette', 'Écran', 'Périphérique'];

  items = signal<CatalogueItem[]>([
    { id: 1, name: 'MacBook Pro M3',       ref: 'REF-PC-042',  category: 'PC',           status: 'DISPONIBLE'   },
    { id: 2, name: 'HP EliteBook 840',     ref: 'REF-PC-031',  category: 'PC',           status: 'EN_PRET'      },
    { id: 3, name: 'Meta Quest 3',         ref: 'REF-VR-008',  category: 'VR',           status: 'EN_PRET'      },
    { id: 4, name: 'iPad Pro 12.9"',       ref: 'REF-TAB-007', category: 'Tablette',     status: 'DISPONIBLE'   },
    { id: 5, name: 'Samsung Galaxy Tab',   ref: 'REF-TAB-012', category: 'Tablette',     status: 'DISPONIBLE'   },
    { id: 6, name: 'Dell UltraSharp 27"',  ref: 'REF-ECR-003', category: 'Écran',        status: 'DISPONIBLE'   },
    { id: 7, name: 'LG 4K 32"',            ref: 'REF-ECR-009', category: 'Écran',        status: 'OUT_OF_SERVICE' },
    { id: 8, name: 'Clavier Keychron K2',  ref: 'REF-PER-015', category: 'Périphérique', status: 'DISPONIBLE'   },
    { id: 9, name: 'Souris Logitech MX',   ref: 'REF-PER-021', category: 'Périphérique', status: 'EN_PRET'      },
  ]);

  filteredItems = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const cat = this.activeCategory();
    return this.items().filter(item => {
      const matchCat = cat === 'Tous' || item.category === cat;
      const matchSearch = item.name.toLowerCase().includes(search) ||
                          item.ref.toLowerCase().includes(search);
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

  toggleSelect(item: CatalogueItem): void {
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

  setCategory(cat: EquipmentCategory | 'Tous'): void {
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

  getCategoryIcon(category: EquipmentCategory): string {
    const icons: Record<EquipmentCategory, string> = {
      'PC': '💻', 'VR': '🥽', 'Tablette': '📱', 'Écran': '🖥️', 'Périphérique': '🖱️'
    };
    return icons[category];
  }

  getStatusLabel(status: EquipmentStatus): string {
    const labels: Record<EquipmentStatus, string> = {
      DISPONIBLE: 'Dispo', EN_PRET: 'En prêt', OUT_OF_SERVICE: 'H.S.', UNDER_REPAIR: 'Réparation'
    };
    return labels[status];
  }

  getStatusClass(status: EquipmentStatus): string {
    const classes: Record<EquipmentStatus, string> = {
      DISPONIBLE: 'badge-success', EN_PRET: 'badge-warning', OUT_OF_SERVICE: 'badge-danger', UNDER_REPAIR: 'badge-danger'
    };
    return classes[status];
  }

  goToDetail(id: number): void {
  this.router.navigate(['/utilisateur/catalogue', id]);
}
}