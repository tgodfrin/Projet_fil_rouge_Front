import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

export type UserRole = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';
export type LoanStatus = 'VALID' | 'IN_PROGRESS' | 'TERMINE' | 'RETARD' | 'INVALID';

export interface UserDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface UserLoan {
  id: number;
  equipmentName: string;
  equipmentRef: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
}

const MOCK_USERS: Record<number, UserDetail> = {
  1: { id: 1, firstName: 'John',   lastName: 'Doe',      email: 'john.doe@mns.fr',      phone: '06 10 00 00 01', role: 'GESTIONNAIRE',  createdAt: '2024-09-01' },
  2: { id: 2, firstName: 'Julie',  lastName: 'Fontaine', email: 'julie.fontaine@mns.fr', phone: '06 10 00 00 02', role: 'COLLABORATEUR', createdAt: '2024-09-03' },
  3: { id: 3, firstName: 'Kevin',  lastName: 'Leclerc',  email: 'kevin.leclerc@mns.fr',  phone: '06 10 00 00 03', role: 'STAGIAIRE',     createdAt: '2024-09-03' },
  4: { id: 4, firstName: 'Sophie', lastName: 'Renard',   email: 'sophie.renard@mns.fr',  phone: '06 10 00 00 04', role: 'INTERVENANT',   createdAt: '2024-09-05' },
  5: { id: 5, firstName: 'Marc',   lastName: 'Durand',   email: 'marc.durand@mns.fr',    phone: '06 10 00 00 05', role: 'STAGIAIRE',     createdAt: '2024-09-05' },
  6: { id: 6, firstName: 'Alice',  lastName: 'Martin',   email: 'alice.martin@mns.fr',   phone: '06 10 00 00 06', role: 'COLLABORATEUR', createdAt: '2024-09-06' },
};

const MOCK_LOANS: Record<number, UserLoan[]> = {
  1: [],
  2: [
    { id: 10, equipmentName: 'MacBook Pro M3',  equipmentRef: 'REF-PC-042',  startDate: '2026-03-03', endDate: '2026-03-10', status: 'TERMINE'    },
    { id: 11, equipmentName: 'iPad Pro 12"',    equipmentRef: 'REF-TAB-007', startDate: '2026-04-01', endDate: '2026-04-15', status: 'VALID'      },
  ],
  3: [
    { id: 20, equipmentName: 'Casque VR Meta',  equipmentRef: 'REF-VR-003',  startDate: '2026-02-10', endDate: '2026-02-17', status: 'RETARD'     },
    { id: 21, equipmentName: 'Surface Pro 9',   equipmentRef: 'REF-PC-051',  startDate: '2026-03-20', endDate: '2026-03-27', status: 'TERMINE'    },
    { id: 22, equipmentName: 'Écran Dell 27"',  equipmentRef: 'REF-ECR-011', startDate: '2026-04-10', endDate: '2026-04-20', status: 'VALID'      },
  ],
  4: [
    { id: 30, equipmentName: 'MacBook Air M2',  equipmentRef: 'REF-PC-038',  startDate: '2026-04-05', endDate: '2026-04-19', status: 'VALID'      },
  ],
  5: [
    { id: 40, equipmentName: 'iPad Mini 6',     equipmentRef: 'REF-TAB-012', startDate: '2026-03-15', endDate: '2026-03-22', status: 'TERMINE'    },
    { id: 41, equipmentName: 'Casque VR Meta',  equipmentRef: 'REF-VR-003',  startDate: '2026-04-08', endDate: '2026-04-18', status: 'IN_PROGRESS'},
  ],
  6: [],
};

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss'
})
export class UserDetailComponent implements OnInit {

  ongletActif = signal<'infos' | 'emprunts' | 'statistiques'>('infos');

  user = signal<UserDetail | null>(null);
  loans = signal<UserLoan[]>([]);

  loanStats = computed(() => {
    const l = this.loans();
    return {
      total:     l.length,
      enCours:   l.filter(x => x.status === 'VALID').length,
      enAttente: l.filter(x => x.status === 'IN_PROGRESS').length,
      termine:   l.filter(x => x.status === 'TERMINE').length,
      enRetard:  l.filter(x => x.status === 'RETARD').length,
    };
  });

  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.user.set(MOCK_USERS[id] ?? null);
    this.loans.set(MOCK_LOANS[id] ?? []);
  }

  retour(): void {
    this.location.back();
  }

  changerOnglet(onglet: 'infos' | 'emprunts' | 'statistiques'): void {
    this.ongletActif.set(onglet);
  }

  getInitials(user: UserDetail): string {
    return user.firstName[0] + user.lastName[0];
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      GESTIONNAIRE:  'Gestionnaire',
      COLLABORATEUR: 'Collaborateur',
      INTERVENANT:   'Intervenant',
      STAGIAIRE:     'Stagiaire',
    };
    return labels[role];
  }

  getRoleClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      GESTIONNAIRE:  'badge-info',
      COLLABORATEUR: 'badge-success',
      INTERVENANT:   'badge-warning',
      STAGIAIRE:     'badge-neutral',
    };
    return classes[role];
  }

  getLoanStatusLabel(status: LoanStatus): string {
    const labels: Record<LoanStatus, string> = {
      VALID:       'En cours',
      IN_PROGRESS: 'En attente',
      TERMINE:     'Terminé',
      RETARD:      'En retard',
      INVALID:     'Refusé',
    };
    return labels[status];
  }

  getLoanStatusClass(status: LoanStatus): string {
    const classes: Record<LoanStatus, string> = {
      VALID:       'b-info',
      IN_PROGRESS: 'b-warning',
      TERMINE:     'b-success',
      RETARD:      'b-danger',
      INVALID:     'b-neutral',
    };
    return classes[status];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
