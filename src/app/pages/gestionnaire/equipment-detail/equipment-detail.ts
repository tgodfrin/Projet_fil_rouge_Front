import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { EquipmentService } from '../../../core/services/equipment.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { DocService } from '../../../core/services/doc.service';
import { LoanService } from '../../../core/services/loan.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { StatusEquipmentService } from '../../../core/services/status-equipment.service';

import { Equipment } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';
import { CharacteristicValue } from '../../../core/models/characteristic-value.model';
import { Doc } from '../../../core/models/doc.model';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';
import { StatusEquipment, StatusEquipmentType } from '../../../core/models/status-equipment.model';

import {
  EquipmentFormComponent,
  EquipmentFormOutput,
} from '../equipment/equipment-form/equipment-form';

type LoanDisplayStatus = StatusLoanType | 'RETARD';
type Onglet = 'infos' | 'historique' | 'documents' | 'statut';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, EquipmentFormComponent],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss'
})
export class EquipmentDetailComponent {

  private route                  = inject(ActivatedRoute);
  private location               = inject(Location);
  private equipmentService       = inject(EquipmentService);
  private characteristicService  = inject(CharacteristicValueService);
  private docService             = inject(DocService);
  private loanService            = inject(LoanService);
  private familyService          = inject(EquipmentFamilyService);
  private statusEquipmentService = inject(StatusEquipmentService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  // ── Données (signal rechargeable → permet de rafraîchir après mutation) ──
  equipment       = signal<Equipment | undefined>(undefined);
  characteristics = signal<CharacteristicValue[]>([]);
  docs            = signal<Doc[]>([]);
  loanHistory     = signal<Loan[]>([]);
  families        = signal<EquipmentFamily[]>([]);
  statusList      = signal<StatusEquipment[]>([]);

  // Statut technique actif = première entrée sans endStatusDate (= non résolu)
  activeStatus = computed(() =>
    this.statusList().find(s => s.endStatusDate === null) ?? null
  );

  // ── UI state ──────────────────────────────────────────────────────────────
  ongletActif       = signal<Onglet>('infos');
  editMode          = signal(false);
  docFormVisible    = signal(false);
  docTitle          = signal('');
  docUrl            = signal('');
  statusFormVisible = signal(false);
  statusType        = signal<StatusEquipmentType>('OUT_OF_SERVICE');
  statusDesc        = signal('');

  constructor() {
    this.loadEquipment();
    this.loadDocs();
    this.loadStatus();
    this.characteristicService.getByEquipment(this.equipmentId)
      .subscribe(c => this.characteristics.set(c));
    this.loanService.getByEquipment(this.equipmentId)
      .subscribe(l => this.loanHistory.set(l));
    this.familyService.getAll()
      .subscribe(f => this.families.set(f));
  }

  // ── Chargement / rechargement ─────────────────────────────────────────────

  loadEquipment(): void {
    this.equipmentService.getById(this.equipmentId)
      .subscribe(eq => this.equipment.set(eq));
  }

  loadDocs(): void {
    this.docService.getByEquipment(this.equipmentId)
      .subscribe(d => this.docs.set(d));
  }

  loadStatus(): void {
    this.statusEquipmentService.getByEquipment(this.equipmentId)
      .subscribe(s => this.statusList.set(s));
  }

  retour(): void { this.location.back(); }

  changerOnglet(onglet: Onglet): void {
    this.ongletActif.set(onglet);
  }

  // ── Feature 2 : édition équipement ───────────────────────────────────────
  // Appelé par equipment-form (output `ajouter`) en mode edit
  // PUT /equipment/:id, puis recharge la fiche et ferme le formulaire
  onSauvegarderEquipement(output: EquipmentFormOutput): void {
    this.equipmentService.update(this.equipmentId, output.payload).subscribe(() => {
      this.editMode.set(false);
      this.loadEquipment();
    });
  }

  // ── Feature 1 : documents ────────────────────────────────────────────────
  // POST /doc avec le body DocCreate, puis recharge la liste
  ajouterDoc(): void {
    const title = this.docTitle().trim();
    const url   = this.docUrl().trim();
    if (!title || !url) return;

    this.docService.create({
      title,
      url,
      equipments: [{ id: this.equipmentId }],
    }).subscribe(() => {
      this.docTitle.set('');
      this.docUrl.set('');
      this.docFormVisible.set(false);
      this.loadDocs();
    });
  }

  // DELETE /doc/:id, puis recharge la liste
  supprimerDoc(id: number): void {
    this.docService.delete(id).subscribe(() => this.loadDocs());
  }

  // ── Feature 3 : statut technique ─────────────────────────────────────────
  // POST /status-equipment, puis recharge statuts + équipement (badge mis à jour)
  signalerStatut(): void {
    const desc = this.statusDesc().trim();
    if (!desc) return;

    this.statusEquipmentService.create({
      statusEquipmentType: this.statusType(),
      descriptionStatus:   desc,
      equipment:           { id: this.equipmentId },
    }).subscribe(() => {
      this.statusDesc.set('');
      this.statusFormVisible.set(false);
      this.loadStatus();
      this.loadEquipment();
    });
  }

  // PUT /status-equipment/:id/resolve, puis recharge statuts + équipement
  resoudreStatut(id: number): void {
    this.statusEquipmentService.resolve(id).subscribe(() => {
      this.loadStatus();
      this.loadEquipment();
    });
  }

  // ── Helpers affichage ────────────────────────────────────────────────────

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

  getStatusTypeLabel(type: StatusEquipmentType): string {
    return type === 'OUT_OF_SERVICE' ? 'Panne' : 'En réparation';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
