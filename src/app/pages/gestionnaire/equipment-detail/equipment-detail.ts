import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { forkJoin, of } from 'rxjs';
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
  private router                   = inject(Router);
  private location                 = inject(Location);
  private equipmentService         = inject(EquipmentService);
  private familyService            = inject(EquipmentFamilyService);
  private characteristicService    = inject(CharacteristicValueService);
  private docService               = inject(DocService);
  private loanService              = inject(LoanService);
  private statusEquipmentService   = inject(StatusEquipmentService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  // Mutable signals — reloadable after updates
  equipment  = signal<Equipment | undefined>(undefined);
  families   = signal<EquipmentFamily[]>([]);
  docs       = signal<Doc[]>([]);
  statusList = signal<StatusEquipment[]>([]);

  characteristics = toSignal(this.characteristicService.getByEquipment(this.equipmentId), { initialValue: [] as CharacteristicValue[] });
  loanHistory     = toSignal(this.loanService.getByEquipment(this.equipmentId),           { initialValue: [] as Loan[] });

  // UI state
  ongletActif       = signal<'infos' | 'historique' | 'documents'>('infos');
  modalEditOpen     = signal(false);
  modalStatusOpen   = signal(false);
  modalDocOpen      = signal(false);
  modalDeleteOpen   = signal(false);

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
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  // ── Loaders ──────────────────────────────────────────

  private loadEquipment(): void {
    this.equipmentService.getById(this.equipmentId).subscribe(data => this.equipment.set(data));
  }

  private loadDocs(): void {
    this.docService.getByEquipment(this.equipmentId).subscribe(data => this.docs.set(data));
  }

  private loadStatusHistory(): void {
    this.statusEquipmentService.getByEquipment(this.equipmentId).subscribe(data => this.statusList.set(data));
  }

  // ── Helpers ──────────────────────────────────────────

  // Returns the currently open (unresolved) StatusEquipment, if any
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

  // Opens the status modal and sets the default option based on current equipment status
  openStatusModal(): void {
    const hasOpenStatus = this.currentOpenStatus !== null;
    this.newStatusType.set(hasOpenStatus ? 'DISPONIBLE' : 'OUT_OF_SERVICE');
    this.newStatusDesc.set('');
    this.modalStatusOpen.set(true);
  }

  // ── Actions ──────────────────────────────────────────

  onEdit(output: EquipmentFormOutput): void {
    this.equipmentService.update(this.equipmentId, output.payload).subscribe(() => {
      // Save only new characteristic rows (those without an id)
      const newRows = output.caracteristiques.filter(row => !row.id && row.characteristicId !== null);
      const requests = newRows.map(row =>
        this.characteristicService.create({
          value: row.value,
          characteristic: { id: row.characteristicId! },
          equipments: [{ id: this.equipmentId }],
        })
      );
      const save$ = requests.length > 0 ? forkJoin(requests) : of(null);
      save$.subscribe(() => {
        this.loadEquipment();
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
      title:      this.newDocTitle(),
      url:        this.newDocUrl(),
      equipmentIds: [this.equipmentId]
    }).subscribe(() => {
      this.loadDocs();
      this.modalDocOpen.set(false);
      this.newDocTitle.set('');
      this.newDocUrl.set('');
    });
  }

  // ── Label helpers ────────────────────────────────────

  getLoanDisplayStatus(loan: Loan): LoanDisplayStatus {
    if (loan.statusType === 'VALID' && new Date(loan.endDate) < new Date()) {
      return 'RETARD';
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
