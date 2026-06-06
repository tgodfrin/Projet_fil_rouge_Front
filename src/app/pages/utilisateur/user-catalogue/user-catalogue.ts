import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { UserService } from '../../../core/services/user.service';
import { Equipment } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';
import { getCategoryIcon } from '../../../core/utils/category-icon';

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
  private userService      = inject(UserService);

  private families         = toSignal(this.familyService.getAll(), { initialValue: [] as EquipmentFamily[] });
  // IDs des familles que le profil connecté est autorisé à emprunter
  allowedFamilyIds         = signal<number[]>([]);

  // Catalogue filtré par profil (endpoint back) — chargé une seule fois au démarrage
  private allEquipments       = signal<Equipment[]>([]);
  // Équipements disponibles sur la période sélectionnée, aussi filtrés par profil
  private availableEquipments = signal<Equipment[]>([]);

  loading        = signal(true);
  startDate      = signal('');
  endDate        = signal('');
  searchTerm     = signal('');
  activeCategory = signal<string>('Tous');
  selectedIds    = signal<number[]>([]);
  submitting          = signal(false);
  submitError         = signal<string | null>(null);
  familyLockedMessage = signal<string | null>(null);

  categories = computed(() => ['Tous', ...this.families().map(f => f.nameEquipmentFamily)]);

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

  private baseList = computed(() =>
    this.datesSet()
      ? this.availableEquipments()
      : this.allEquipments().filter(e => e.status === 'DISPONIBLE')
  );

  equipments = computed(() => {
    let list = this.baseList();
    const q = this.searchTerm().trim().toLowerCase();
    if (q) list = list.filter(e => e.equipmentName.toLowerCase().includes(q));
    const cat = this.activeCategory();
    if (cat !== 'Tous') list = list.filter(e => e.equipmentFamily.nameEquipmentFamily === cat);
    return list;
  });

  canSubmit = computed(() => this.selectedIds().length > 0 && this.datesSet());

  ngOnInit(): void {
    // Récupère les familles autorisées du profil connecté
    this.userService.getMe().subscribe({
      next: (user) => {
        const ids = user.profil.equipmentFamilies?.map(f => f.id) ?? [];
        this.allowedFamilyIds.set(ids);
      }
    });

    // Utilise l'endpoint catalogue filtré par profil — pas GET /equipment/list qui renvoie tout
    this.equipmentService.getCatalogue().subscribe({
      next:  (data) => { this.allEquipments.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });
  }

  isFamilyAllowed(familyName: string): boolean {
    const family = this.families().find(f => f.nameEquipmentFamily === familyName);
    if (!family) return true; // 'Tous' ou famille inconnue : pas de restriction
    return this.allowedFamilyIds().includes(family.id);
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

  private loadAvailableIfReady(): void {
    const s = this.startDate();
    const e = this.endDate();
    if (s && e && new Date(e) > new Date(s)) {
      this.loading.set(true);
      // Utilise l'endpoint disponible + filtre profil combinés
      this.equipmentService.getCatalogueAvailable(s, e).subscribe({
        next:  (data) => { this.availableEquipments.set(data); this.loading.set(false); },
        error: ()     => this.loading.set(false)
      });
    }
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: string): void {
    if (cat !== 'Tous' && !this.isFamilyAllowed(cat)) {
      this.familyLockedMessage.set(`Les emprunts des équipements de la catégorie "${cat}" ne sont pas disponibles pour votre rôle.`);
      return;
    }
    this.familyLockedMessage.set(null);
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

  goToDetail(id: number): void {
    this.router.navigate(['/utilisateur/catalogue', id]);
  }

  /**
   * Navigue vers le récapitulatif avec les IDs et dates en navigation state.
   * C'est le bouton "Confirmer" du récapitulatif qui crée réellement les emprunts.
   * On ne crée plus les emprunts ici — l'utilisateur doit valider la récap avant.
   */
  goToSummary(): void {
    if (!this.canSubmit()) return;
    this.submitError.set(null);

    this.router.navigate(['/utilisateur/recapitulatif'], {
      state: {
        equipmentIds: this.selectedIds(),
        beginDate:    this.startDate(),
        endDate:      this.endDate(),
      }
    });
  }

  getTodayString(): string {
    const d = new Date();
    return d.getFullYear() + '-'
      + String(d.getMonth() + 1).padStart(2, '0') + '-'
      + String(d.getDate()).padStart(2, '0');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  getCategoryIcon(familyName: string): string {
    return getCategoryIcon(familyName);
  }
}
