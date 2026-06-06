import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ExportComponent } from '../../../shared/export/export';
import { AppUser } from '../../../core/models/user.model';
import { ProfilType } from '../../../core/models/profil.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ExportComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit, OnDestroy {

  private router      = inject(Router);
  private userService = inject(UserService);

  users        = signal<AppUser[]>([]);
  // Signal séparé chargé une seule fois — utilisé exclusivement pour les comptages par rôle
  // Ne doit jamais être modifié par les filtres ou la recherche
  allUsersForCount = signal<AppUser[]>([]);
  searchTerm   = signal('');
  activeFilter = signal<ProfilType | 'TOUS'>('TOUS');

  private searchSubject = new Subject<string>();
  private sub!: Subscription;

  ngOnInit(): void {
    // Chargement initial depuis le serveur
    this.userService.getAll().subscribe(data => {
      this.users.set(data);
      // Chargement des totaux globaux — ne change pas avec les filtres
      this.allUsersForCount.set(data);
    });

    // Recherche serveur avec debounce 300ms
    // Si la recherche est vide, on recharge selon le filtre de profil actif.
    this.sub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim()) return this.userService.search(q);
        const filter = this.activeFilter();
        return filter === 'TOUS'
          ? this.userService.getAll()
          : this.userService.getByProfil(filter as string);
      })
    ).subscribe(data => this.users.set(data));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // Filtre profil côté serveur — recharge la liste depuis l'API
  setFilter(filter: ProfilType | 'TOUS'): void {
    this.activeFilter.set(filter);
    const q = this.searchTerm().trim();
    if (q) {
      // Recherche active : garder les résultats de recherche, filtrer côté client par profil
      this.searchSubject.next(q);
    } else {
      const obs = filter === 'TOUS'
        ? this.userService.getAll()
        : this.userService.getByProfil(filter as string);
      obs.subscribe(data => this.users.set(data));
    }
  }

  // Si une recherche et un filtre de profil sont combinés, on filtre côté client sur les résultats de la recherche.
  filteredUsers = computed(() => {
    const filter = this.activeFilter();
    const q      = this.searchTerm().trim();
    if (q && filter !== 'TOUS') {
      return this.users().filter(u => u.profil.type === filter);
    }
    return this.users();
  });

  // Comptages basés sur allUsersForCount — jamais affecté par les filtres serveur
  countByRole(role: ProfilType | 'TOUS'): number {
    if (role === 'TOUS') return this.allUsersForCount().length;
    return this.allUsersForCount().filter(u => u.profil.type === role).length;
  }

  usersExport = computed(() =>
    this.users().map(u => ({
      id:            u.id,
      prenom:        u.name,
      nom:           u.lastname,
      email:         u.email,
      role:          this.getRoleLabel(u.profil.type),
      membre_depuis: u.createdAt
    }))
  );

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchTerm.set(q);
    this.searchSubject.next(q);
  }

  getInitials(user: AppUser): string {
    return user.name[0] + user.lastname[0];
  }

  getRoleLabel(role: ProfilType): string {
    const labels: Record<ProfilType, string> = {
      GESTIONNAIRE:  'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT:   'Intervenant',
      STAGIAIRE:     'Stagiaire'
    };
    return labels[role];
  }

  getRoleClass(role: ProfilType): string {
    const classes: Record<ProfilType, string> = {
      GESTIONNAIRE:  'badge-info',
      COLLABORATEUR: 'badge-success',
      INTERVENANT:   'badge-warning',
      STAGIAIRE:     'badge-neutral'
    };
    return classes[role];
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/utilisateurs', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/utilisateurs/nouveau']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
