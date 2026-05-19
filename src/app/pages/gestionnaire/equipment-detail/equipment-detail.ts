import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { DocService } from '../../../core/services/doc.service';
import { LoanService } from '../../../core/services/loan.service';
import { Equipment } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';
import { CharacteristicValue } from '../../../core/models/characteristic-value.model';
import { Doc } from '../../../core/models/doc.model';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';
import { EquipmentFormComponent, EquipmentFormOutput } from '../equipment/equipment-form/equipment-form';

type LoanDisplayStatus = StatusLoanType | 'RETARD';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, EquipmentFormComponent],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent {

  private route                    = inject(ActivatedRoute);
  private location                 = inject(Location);
  private equipmentService         = inject(EquipmentService);
  private familyService            = inject(EquipmentFamilyService);
  private characteristicService    = inject(CharacteristicValueService);
  private docService               = inject(DocService);
  private loanService              = inject(LoanService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  // Données principales — signal mutable pour pouvoir recharger après édition
  equipment       = signal<Equipment | undefined>(undefined);
  families        = signal<EquipmentFamily[]>([]);
  characteristics = toSignal(this.characteristicService.getByEquipment(this.equipmentId), { initialValue: [] as CharacteristicValue[] });
  docs            = toSignal(this.docService.getByEquipment(this.equipmentId),             { initialValue: [] as Doc[] });

  // Historique : emprunts filtrés côté serveur via GET /loan/equipment/:id
  loanHistory = toSignal(this.loanService.getByEquipment(this.equipmentId), { initialValue: [] as Loan[] });

  ongletActif        = signal<'infos' | 'historique' | 'documents'>('infos');
  modalEditOpen = signal(false);

  constructor() {
    this.loadEquipment();
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  private loadEquipment(): void {
    this.equipmentService.getById(this.equipmentId).subscribe(data => this.equipment.set(data));
  }

  retour(): void { this.location.back(); }

  onEdit(output: EquipmentFormOutput): void {
    this.equipmentService.update(this.equipmentId, output.payload).subscribe(() => {
      this.loadEquipment();
      this.modalEditOpen.set(false);
    });
  }

  changerOnglet(onglet: 'infos' | 'historique' | 'documents'): void {
    this.ongletActif.set(onglet);
  }

  // RETARD = VALID (autorisé) dont endDate est dépassée et non encore retourné
  getLoanDisplayStatus(loan: Loan): LoanDisplayStatus {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
    }
    return loan.statusType;
  }

  getLoanStatusLabel(status: LoanDisplayStatus): string {
    const labels: Record<LoanDisplayStatus, string> = {
      IN_PROGRESS: 'En attente',   // en cours d'examen par un gestionnaire
      VALID:       'En cours',     // autorisé par un gestionnaire
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
