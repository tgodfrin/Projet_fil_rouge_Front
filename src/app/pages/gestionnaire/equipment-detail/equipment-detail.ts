import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { DocService } from '../../../core/services/doc.service';
import { LoanService } from '../../../core/services/loan.service';
import { CharacteristicValue } from '../../../core/models/characteristic-value.model';
import { Doc } from '../../../core/models/doc.model';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';

type LoanDisplayStatus = StatusLoanType | 'RETARD';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent {

  private route                    = inject(ActivatedRoute);
  private location                 = inject(Location);
  private equipmentService         = inject(EquipmentService);
  private characteristicService    = inject(CharacteristicValueService);
  private docService               = inject(DocService);
  private loanService              = inject(LoanService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  // Données principales
  equipment       = toSignal(this.equipmentService.getById(this.equipmentId));
  characteristics = toSignal(this.characteristicService.getByEquipment(this.equipmentId), { initialValue: [] as CharacteristicValue[] });
  docs            = toSignal(this.docService.getByEquipment(this.equipmentId),             { initialValue: [] as Doc[] });

  // Historique : emprunts filtrés côté serveur via GET /loan/equipment/:id
  loanHistory = toSignal(this.loanService.getByEquipment(this.equipmentId), { initialValue: [] as Loan[] });

  ongletActif = signal<'infos' | 'historique' | 'documents'>('infos');

  retour(): void { this.location.back(); }

  changerOnglet(onglet: 'infos' | 'historique' | 'documents'): void {
    this.ongletActif.set(onglet);
  }

  // RETARD = IN_PROGRESS dont endDate est dépassée
  getLoanDisplayStatus(loan: Loan): LoanDisplayStatus {
    if (loan.statusType === 'IN_PROGRESS' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  getLoanStatusLabel(status: LoanDisplayStatus): string {
    const labels: Record<LoanDisplayStatus, string> = {
      VALID:       'En attente',
      IN_PROGRESS: 'En cours',
      TERMINE:     'Terminé',
      RETARD:      'En retard',
      INVALID:     'Refusé',
    };
    return labels[status];
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      DISPONIBLE:     'Disponible',
      EN_PRET:        'En prêt',
      OUT_OF_SERVICE: 'Hors service',
      UNDER_REPAIR:   'En réparation',
    };
    return labels[statut] || statut;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
