import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExportComponent } from '../../../shared/export/export';
import { UserRole, User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ExportComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent {

  constructor(private router: Router) {}

  searchTerm = signal('');
  activeFilter = signal<UserRole | 'TOUS'>('TOUS');

  users = signal<User[]>([
  {
    id: 1,
    name: 'John',
    lastname: 'Doe',
    email: 'john.doe@mns.fr',
    role: 'GESTIONNAIRE',
    activeLoans: 0,
    createdAt: '2024-09-01'
  },
  {
    id: 2,
    name: 'Julie',
    lastname: 'Fontaine',
    email: 'julie.fontaine@mns.fr',
    role: 'COLLABORATEUR',
    activeLoans: 1,
    createdAt: '2024-09-03'
  },
  {
    id: 3,
    name: 'Kevin',
    lastname: 'Leclerc',
    email: 'kevin.leclerc@mns.fr',
    role: 'STAGIAIRE',
    activeLoans: 2,
    createdAt: '2024-09-03'
  },
  {
    id: 4,
    name: 'Sophie',
    lastname: 'Renard',
    email: 'sophie.renard@mns.fr',
    role: 'INTERVENANT',
    activeLoans: 1,
    createdAt: '2024-09-05'
  },
  {
    id: 5,
    name: 'Marc',
    lastname: 'Durand',
    email: 'marc.durand@mns.fr',
    role: 'STAGIAIRE',
    activeLoans: 1,
    createdAt: '2024-09-05'
  },
  {
    id: 6,
    name: 'Alice',
    lastname: 'Martin',
    email: 'alice.martin@mns.fr',
    role: 'COLLABORATEUR',
    activeLoans: 0,
    createdAt: '2024-09-06'
  }
]);

  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const filter = this.activeFilter();

    return this.users().filter(u => {
      const matchRole = filter === 'TOUS' || u.role === filter;
      const matchSearch =
        u.name.toLowerCase().includes(search) ||
        u.lastname.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search);
      return matchRole && matchSearch;
    });
  });

  countByRole(role: UserRole | 'TOUS'): number {
    if (role === 'TOUS') return this.users().length;
    return this.users().filter(u => u.role === role).length;
  }

  usersExport = computed(() =>
    this.users().map(u => ({
      id: u.id,
      prenom: u.name,
      nom: u.lastname,
      email: u.email,
      role: this.getRoleLabel(u.role),
      emprunts_actifs: u.activeLoans,
      membre_depuis: u.createdAt
    }))
  );

  setFilter(filter: UserRole | 'TOUS'): void {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  getInitials(user: User): string {
    return user.name[0] + user.lastname[0];
  }

  getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    GESTIONNAIRE:  'Gestionnaire',
    COLLABORATEUR: 'Collaborateur',
    INTERVENANT:   'Intervenant',
    STAGIAIRE:     'Stagiaire'
  };
  return labels[role];
}

getRoleClass(role: UserRole): string {
  const classes: Record<UserRole, string> = {
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