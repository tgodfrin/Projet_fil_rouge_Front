import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export type EquipmentStatus = 'DISPONIBLE' | 'EN_PRET' | 'HORS_SERVICE';
export type EquipmentCategory = 'PC' | 'VR' | 'Tablette' | 'Écran' | 'Périphérique';

export interface CatalogueItem {
  id: number;
  name: string;
  ref: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
}

@Component({
  selector: 'app-user-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-catalogue.html',
  styleUrl: './user-catalogue.scss'
})
export class UserCatalogueComponent {
  searchTerm = signal('');
  activeCategory = signal<EquipmentCategory | 'Tous'>('Tous');

  categories: (EquipmentCategory | 'Tous')[] = ['Tous', 'PC', 'VR', 'Tablette', 'Écran', 'Périphérique'];

  items = signal<CatalogueItem[]>([
    { id: 1, name: 'MacBook Pro M3',       ref: 'REF-PC-042',  category: 'PC',          status: 'DISPONIBLE'  },
    { id: 2, name: 'HP EliteBook 840',     ref: 'REF-PC-031',  category: 'PC',          status: 'EN_PRET'     },
    { id: 3, name: 'Meta Quest 3',         ref: 'REF-VR-008',  category: 'VR',          status: 'EN_PRET'     },
    { id: 4, name: 'iPad Pro 12.9"',       ref: 'REF-TAB-007', category: 'Tablette',    status: 'DISPONIBLE'  },
    { id: 5, name: 'Samsung Galaxy Tab',   ref: 'REF-TAB-012', category: 'Tablette',    status: 'DISPONIBLE'  },
    { id: 6, name: 'Dell UltraSharp 27"',  ref: 'REF-ECR-003', category: 'Écran',       status: 'DISPONIBLE'  },
    { id: 7, name: 'LG 4K 32"',            ref: 'REF-ECR-009', category: 'Écran',       status: 'HORS_SERVICE' },
    { id: 8, name: 'Clavier Keychron K2',  ref: 'REF-PER-015', category: 'Périphérique', status: 'DISPONIBLE' },
    { id: 9, name: 'Souris Logitech MX',   ref: 'REF-PER-021', category: 'Périphérique', status: 'EN_PRET'    },
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

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: EquipmentCategory | 'Tous'): void {
    this.activeCategory.set(cat);
  }

  getCategoryIcon(category: EquipmentCategory): string {
    const icons: Record<EquipmentCategory, string> = {
      'PC': '💻', 'VR': '🥽', 'Tablette': '📱', 'Écran': '🖥️', 'Périphérique': '🖱️'
    };
    return icons[category];
  }

  getStatusLabel(status: EquipmentStatus): string {
    const labels: Record<EquipmentStatus, string> = {
      DISPONIBLE: 'Dispo', EN_PRET: 'En prêt', HORS_SERVICE: 'H.S.'
    };
    return labels[status];
  }

  getStatusClass(status: EquipmentStatus): string {
    const classes: Record<EquipmentStatus, string> = {
      DISPONIBLE: 'badge-success', EN_PRET: 'badge-warning', HORS_SERVICE: 'badge-danger'
    };
    return classes[status];
  }
}