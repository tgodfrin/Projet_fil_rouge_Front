import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Equipment, EquipmentStatus } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';

@Component({
  selector: 'app-user-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-catalogue.html',
  styleUrl: './user-catalogue.scss'
})
export class UserCatalogueComponent implements OnInit, OnDestroy {
  private router           = inject(Router);
  private equipmentService = inject(EquipmentService);
  private familyService    = inject(EquipmentFamilyService);
  private loanService      = inject(LoanService);
  private authService      = inject(AuthService);

  private families = toSignal(this.familyService.getAll(), { initialValue: [] as EquipmentFamily[] });

  equipments     = signal<Equipment[]>([]);
  searchTerm     = signal('');
  activeCategory = signal<string>('Tous');
  activeFamilyId = signal<number | null>(null);

  // Mode multi-sélection
  multiMode        = signal(false);
  multiStartDate   = signal('');
  multiEndDate     = signal('');
  selectedIds      = signal<number[]>([]);
  submittingMulti  = signal(false);
  multiError       = signal<string | null>(null);

  private searchSubject = new Subject<string>();
  private sub!: Subscription;

  // Catégories dynamiques depuis les vraies familles
  categories = computed(() => ['Tous', ...this.families().map(f => f.nameEquipmentFamily)]);

  ngOnInit(): void {
    // Chargement initial
    this.equipmentService.getAll().subscribe(data => this.equipments.set(data));

    // Recherche serveur avec debounce 300ms
    // Si vide → rechargement selon la famille active
    this.sub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim()) return this.equipmentService.searchByName(q);
        const familyId = this.activeFamilyId();
        return familyId
          ? this.equipmentService.getByFamily(familyId)
          : this.equipmentService.getAll();
      })
    ).subscribe(data => this.equipments.set(data));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchTerm.set(q);
    this.searchSubject.next(q);
  }

  // Filtre par famille côté serveur
  setCategory(cat: string): void {
    this.activeCategory.set(cat);
    const family = this.families().find(f => f.nameEquipmentFamily === cat);
    this.activeFamilyId.set(family?.id ?? null);

    // Si une recherche est active, relancer la recherche (le switchMap gérera la famille)
    const q = this.searchTerm().trim();
    if (q) {
      this.searchSubject.next(q);
    } else if (cat === 'Tous') {
      this.equipmentService.getAll().subscribe(data => this.equipments.set(data));
    } else if (family) {
      this.equipmentService.getByFamily(family.id).subscribe(data => this.equipments.set(data));
    }
  }

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

  onStartDate(event: Event): void {
    this.multiStartDate.set((event.target as HTMLInputElement).value);
  }

  onEndDate(event: Event): void {
    this.multiEndDate.set((event.target as HTMLInputElement).value);
  }

  submitMulti(): void {
    const user = this.authService.currentUser();
    if (!this.canMultiSubmit() || this.submittingMulti() || !user) return;
    this.submittingMulti.set(true);
    this.multiError.set(null);

    const begin = `${this.multiStartDate()}T08:00:00`;
    const end   = `${this.multiEndDate()}T18:00:00`;

    // Un POST /loan par équipement sélectionné — forkJoin attend que tous réussissent
    const requests = this.selectedIds().map(id =>
      this.loanService.create({
        beginDate:   begin,
        endDate:     end,
        requesterId: user.id,
        equipmentId: id
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.submittingMulti.set(false);
        this.toggleMultiMode();
        this.router.navigate(['/utilisateur/confirmation']);
      },
      error: (err) => {
        this.submittingMulti.set(false);
        if (err.status === 403) {
          this.multiError.set('Votre profil ne vous autorise pas à emprunter un ou plusieurs équipements sélectionnés.');
        } else {
          this.multiError.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }

  getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
