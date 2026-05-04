import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
export class UserListComponent {

  private router      = inject(Router);
  private userService = inject(UserService);

  
  users = toSignal(this.userService.getAll(), { initialValue: [] as AppUser[] });

  searchTerm   = signal('');
  activeFilter = signal<ProfilType | 'TOUS'>('TOUS');

  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const filter = this.activeFilter();

    return this.users().filter(u => {
      const matchRole   = filter === 'TOUS' || u.profil.type === filter;
      const matchSearch =
        u.name.toLowerCase().includes(search)     ||
        u.lastname.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search);
      return matchRole && matchSearch;
    });
  });

  countByRole(role: ProfilType | 'TOUS'): number {
    if (role === 'TOUS') return this.users().length;
    return this.users().filter(u => u.profil.type === role).length;
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

  setFilter(filter: ProfilType | 'TOUS'): void {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
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
