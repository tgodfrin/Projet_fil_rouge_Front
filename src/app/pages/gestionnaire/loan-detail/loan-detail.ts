import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanStatus } from '../../../core/models/loan.model';

export interface LoanDetail {
  id: number;
  equipmentName: string;
  equipmentRef: string;
  equipmentFamille: string;
  borrowerName: string;
  borrowerInitials: string;
  borrowerEmail: string;
  borrowerRole: string;
  startDate: string;
  endDate: string;
  returnDate?: string;
  status: LoanStatus;
  comment?: string;
}

const MOCK_LOANS: Record<number, LoanDetail> = {
  1: {
    id: 1,
    equipmentName: 'iPad Pro 12.9"',     equipmentRef: 'REF-TAB-03',  equipmentFamille: 'Tablette',
    borrowerName: 'Julie Fontaine',       borrowerInitials: 'JF',      borrowerEmail: 'julie.fontaine@mns.fr', borrowerRole: 'Collaborateur',
    startDate: '2026-04-10',             endDate: '2026-04-17',
    status: 'IN_PROGRESS',
  },
  2: {
    id: 2,
    equipmentName: 'Meta Quest 3',        equipmentRef: 'REF-VR-008',  equipmentFamille: 'VR',
    borrowerName: 'Kevin Leclerc',        borrowerInitials: 'KL',      borrowerEmail: 'kevin.leclerc@mns.fr', borrowerRole: 'Stagiaire',
    startDate: '2026-04-12',             endDate: '2026-04-15',
    status: 'IN_PROGRESS',
    comment: 'Pour le cours de UX immersif',
  },
  3: {
    id: 3,
    equipmentName: 'MacBook Pro M3',      equipmentRef: 'REF-PC-042',  equipmentFamille: 'PC',
    borrowerName: 'Marc Durand',          borrowerInitials: 'MD',      borrowerEmail: 'marc.durand@mns.fr', borrowerRole: 'Stagiaire',
    startDate: '2026-04-07',             endDate: '2026-04-11',
    status: 'RETARD',
  },
  4: {
    id: 4,
    equipmentName: 'iPad Pro 12.9"',     equipmentRef: 'REF-TAB-03',  equipmentFamille: 'Tablette',
    borrowerName: 'Sophie Renard',        borrowerInitials: 'SR',      borrowerEmail: 'sophie.renard@mns.fr', borrowerRole: 'Intervenant',
    startDate: '2026-04-08',             endDate: '2026-04-14',
    status: 'VALID',
  },
  5: {
    id: 5,
    equipmentName: 'HP EliteBook 840',    equipmentRef: 'REF-PC-039',  equipmentFamille: 'PC',
    borrowerName: 'Tom Vasseur',          borrowerInitials: 'TV',      borrowerEmail: 'tom.vasseur@mns.fr', borrowerRole: 'Collaborateur',
    startDate: '2026-04-14',             endDate: '2026-04-22',
    status: 'VALID',
  },
};

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.scss'
})
export class LoanDetailComponent implements OnInit {

  loan = signal<LoanDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loan.set(MOCK_LOANS[id] ?? null);
  }

  retour(): void {
    this.location.back();
  }

  voirEquipement(): void {
    // Navigation vers la page équipement (mock : id 1 par défaut)
    this.router.navigate(['/equipements', 1]);
  }

  voirUtilisateur(name: string): void {
    // Retrouve l'id utilisateur par son nom (mock)
    const userMap: Record<string, number> = {
      'Julie Fontaine': 2, 'Kevin Leclerc': 3,
      'Marc Durand': 5,    'Sophie Renard': 4, 'Tom Vasseur': 5,
    };
    const id = userMap[name] ?? 1;
    this.router.navigate(['/utilisateurs', id]);
  }

  getStatusLabel(status: LoanStatus): string {
    const labels: Record<LoanStatus, string> = {
      IN_PROGRESS: 'En attente', VALID: 'En cours',
      RETARD: 'En retard',       TERMINE: 'Terminé', INVALID: 'Refusé',
    };
    return labels[status];
  }

  getStatusClass(status: LoanStatus): string {
    const classes: Record<LoanStatus, string> = {
      IN_PROGRESS: 'b-warning', VALID: 'b-success',
      RETARD: 'b-danger',       TERMINE: 'b-neutral', INVALID: 'b-danger',
    };
    return classes[status];
  }

  isLate(loan: LoanDetail): boolean {
    return loan.status === 'RETARD';
  }

  daysLate(loan: LoanDetail): number {
    const end = new Date(loan.endDate);
    const now = new Date();
    return Math.max(0, Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)));
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
