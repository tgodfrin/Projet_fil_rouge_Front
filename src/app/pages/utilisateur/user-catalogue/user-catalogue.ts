import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private loanService      = inject(LoanService);
  private authService      = inject(AuthService);

  private families = toSignal(this.familyService.getAll(), { initialValue: [] as EquipmentFamily[] });

  // Deux listes : tous les équipements (sans dates) et ceux disponibles sur la période choisie
  private allEquipments       = signal<Equipment[]>([]);
  private availableEquipments = signal<Equipment[]>([]);

  loading        = signal(true);
  startDate      = signal('');
  endDate        = signal('');
  searchTerm     = signal('');
  activeCategory = signal<string>('Tous');
  selectedIds    = signal<number[]>([]);
  submitting     = signal(false);
  submitError    = signal<string | null>(null);

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

  // Sans dates → équipements DISPONIBLE actuellement
  // Avec dates → équipements libres sur la période (filtrés par le back via /equipment/available)
  private baseList = computed(() =>
    this.datesSet()
      ? this.availableEquipments()
      : this.allEquipments().filter(e => e.status === 'DISPONIBLE')
  );

  // Liste affichée : baseList filtrée par recherche + catégorie (client-side)
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
    this.equipmentService.getAll().subscribe({
      next:  (data) => { this.allEquipments.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });
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

  // Appelle /equipment/available uniquement si les deux dates forment une période valide
  private loadAvailableIfReady(): void {
    const s = this.startDate();
    const e = this.endDate();
    if (s && e && new Date(e) > new Date(s)) {
      this.loading.set(true);
      this.equipmentService.getAvailable(s, e)
        .subscribe({
          next:  (data) => { this.availableEquipments.set(data); this.loading.set(false); },
          error: ()     => this.loading.set(false)
        });
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

  goToDetail(id: number): void {
    this.router.navigate(['/utilisateur/catalogue', id]);
  }

  // Soumet directement les demandes groupées et redirige vers la confirmation
  goToSummary(): void {
    const user = this.authService.currentUser();
    if (!this.canSubmit() || this.submitting() || !user) return;
    this.submitting.set(true);
    this.submitError.set(null);

    const begin   = this.startDate();
    const end     = this.endDate();
    const groupId = crypto.randomUUID();

    const requests = this.selectedIds().map(id =>
      this.loanService.create({
        beginDate:   begin,
        endDate:     end,
        requesterId: user.id,
        equipmentId: id,
        groupId
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/utilisateur/confirmation']);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 403) {
          this.submitError.set('Votre profil ne vous autorise pas à emprunter un ou plusieurs équipements sélectionnés.');
        } else if (err.status === 409) {
          this.submitError.set('Un ou plusieurs équipements ne sont plus disponibles sur cette période. Veuillez actualiser.');
        } else {
          this.submitError.set('Une erreur est survenue. Veuillez réessayer.');
        }
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
