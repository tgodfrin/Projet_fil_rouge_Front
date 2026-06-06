import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { DocService } from '../../../core/services/doc.service';
import { LoanService } from '../../../core/services/loan.service';
import { StatusEquipmentService } from '../../../core/services/status-equipment.service';
import { Equipment } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';
import { CharacteristicValue } from '../../../core/models/characteristic-value.model';
import { Doc } from '../../../core/models/doc.model';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';
import { StatusEquipment, StatusEquipmentType } from '../../../core/models/status-equipment.model';
import { EquipmentFormComponent, EquipmentFormOutput } from '../equipment/equipment-form/equipment-form';

type LoanDisplayStatus = StatusLoanType | 'RETARD' | 'A_VENIR';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, EquipmentFormComponent],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent {

  private route                    = inject(ActivatedRoute);
  private router                   = inject(Router);
  private location                 = inject(Location);
  private equipmentService         = inject(EquipmentService);
  private familyService            = inject(EquipmentFamilyService);
  private characteristicService    = inject(CharacteristicValueService);
  private docService               = inject(DocService);
  private loanService              = inject(LoanService);
  private statusEquipmentService   = inject(StatusEquipmentService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  // Mutable signals — tous rechargeables après modification
  equipment       = signal<Equipment | undefined>(undefined);
  families        = signal<EquipmentFamily[]>([]);
  docs            = signal<Doc[]>([]);
  statusList      = signal<StatusEquipment[]>([]);
  characteristics = signal<CharacteristicValue[]>([]);
  loanHistory     = signal<Loan[]>([]);

  // UI state
  ongletActif     = signal<'infos' | 'historique' | 'documents'>('infos');
  modalEditOpen   = signal(false);
  modalStatusOpen = signal(false);
  modalDocOpen    = signal(false);
  modalDeleteOpen = signal(false);

  // Status form values
  newStatusType = signal<StatusEquipmentType | 'DISPONIBLE'>('OUT_OF_SERVICE');
  newStatusDesc = signal('');

  // Doc form values
  newDocTitle = signal('');
  newDocUrl   = signal('');

  constructor() {
    this.loadEquipment();
    this.loadDocs();
    this.loadStatusHistory();
    this.loadCharacteristics();
    this.loadLoanHistory();
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  // Loaders

  private loadEquipment(): void {
    this.equipmentService.getById(this.equipmentId).subscribe(data => this.equipment.set(data));
  }

  private loadDocs(): void {
    this.docService.getByEquipment(this.equipmentId).subscribe(data => this.docs.set(data));
  }

  private loadStatusHistory(): void {
    this.statusEquipmentService.getByEquipment(this.equipmentId).subscribe(data =>
      this.statusList.set([...data].sort((a, b) =>
        new Date(b.beginStatusDate).getTime() - new Date(a.beginStatusDate).getTime()
      ))
    );
  }

  private loadCharacteristics(): void {
    this.characteristicService.getByEquipment(this.equipmentId).subscribe(data => this.characteristics.set(data));
  }

  private loadLoanHistory(): void {
    this.loanService.getByEquipment(this.equipmentId).subscribe(data =>
      this.loanHistory.set([...data].sort((a, b) =>
        new Date(b.beginDate).getTime() - new Date(a.beginDate).getTime()
      ))
    );
  }

  // Helpers

  // Statut technique actuellement ouvert (non résolu), s'il y en a un.
  get currentOpenStatus(): StatusEquipment | null {
    return this.statusList().find(s => s.endStatusDate === null) ?? null;
  }

  retour(): void { this.location.back(); }

  onDelete(): void {
    this.equipmentService.delete(this.equipmentId).subscribe(() => {
      this.modalDeleteOpen.set(false);
      this.router.navigate(['/equipements']);
    });
  }

  changerOnglet(onglet: 'infos' | 'historique' | 'documents'): void {
    this.ongletActif.set(onglet);
  }

  // Ouvre la fenêtre de statut et choisit l'option par défaut selon le statut actuel de l'équipement.
  openStatusModal(): void {
    const hasOpenStatus = this.currentOpenStatus !== null;
    this.newStatusType.set(hasOpenStatus ? 'DISPONIBLE' : 'OUT_OF_SERVICE');
    this.newStatusDesc.set('');
    this.modalStatusOpen.set(true);
  }

  // Actions

  onEdit(output: EquipmentFormOutput): void {
    this.equipmentService.update(this.equipmentId, output.payload).subscribe(() => {
      const existingIds = this.characteristics().map(c => c.id);
      const submittedWithId = output.caracteristiques.filter(r => r.id);
      const submittedIds = submittedWithId.map(r => r.id!);

      // Caractéristiques supprimées (étaient en base, absentes de la soumission)
      const toDelete = existingIds.filter(id => !submittedIds.includes(id));
      // Caractéristiques modifiées (id présent dans la soumission)
      const toUpdate = submittedWithId.filter(r => r.characteristicId !== null);
      // Nouvelles caractéristiques (sans id)
      const toCreate = output.caracteristiques.filter(r => !r.id && r.characteristicId !== null);

      const ops: Observable<any>[] = [
        ...toDelete.map(id => this.characteristicService.delete(id)),
        ...toUpdate.map(r => this.characteristicService.update(r.id!, {
          value:            r.value,
          characteristicId: r.characteristicId!,
          equipmentId:      this.equipmentId,
        })),
        ...toCreate.map(r => this.characteristicService.create({
          value:            r.value,
          characteristicId: r.characteristicId!,
          equipmentId:      this.equipmentId,
        })),
      ];

      const source$: Observable<any> = ops.length > 0 ? forkJoin(ops) : of(null);
      source$.subscribe(() => {
        this.loadEquipment();
        this.loadCharacteristics();
        this.modalEditOpen.set(false);
      });
    });
  }

  onChangeStatus(): void {
    const type = this.newStatusType();
    if (type === 'DISPONIBLE') {
      const current = this.currentOpenStatus;
      if (!current) return;
      this.statusEquipmentService.resolve(current.id).subscribe(() => {
        this.loadEquipment();
        this.loadStatusHistory();
        this.modalStatusOpen.set(false);
      });
    } else {
      this.statusEquipmentService.create({
        statusEquipmentType: type,
        descriptionStatus:   this.newStatusDesc(),
        equipmentId:         this.equipmentId
      }).subscribe(() => {
        this.loadEquipment();
        this.loadStatusHistory();
        this.modalStatusOpen.set(false);
        this.newStatusDesc.set('');
      });
    }
  }

  onAddDoc(): void {
    if (!this.newDocTitle() || !this.newDocUrl()) return;
    this.docService.create({
      title:        this.newDocTitle(),
      url:          this.newDocUrl(),
      equipmentIds: [this.equipmentId]
    }).subscribe(() => {
      this.loadDocs();
      this.modalDocOpen.set(false);
      this.newDocTitle.set('');
      this.newDocUrl.set('');
    });
  }

  onDeleteDoc(docId: number): void {
    this.docService.delete(docId).subscribe(() => this.loadDocs());
  }

  // Label helpers

  getLoanDisplayStatus(loan: Loan): LoanDisplayStatus {
    const now = new Date();
    if (loan.statusType === 'VALID') {
      if (new Date(loan.endDate) < now)   return 'RETARD';
      if (new Date(loan.beginDate) > now) return 'A_VENIR';
    }
    return loan.statusType;
  }

  getLoanStatusLabel(status: LoanDisplayStatus): string {
    const labels: Record<LoanDisplayStatus, string> = {
      IN_PROGRESS: 'En attente',
      VALID:       'En cours',
      TERMINE:     'Terminé',
      RETARD:      'En retard',
      INVALID:     'Refusé',
      A_VENIR:     'Validé',
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
