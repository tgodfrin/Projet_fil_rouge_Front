import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { EquipmentFormComponent, EquipmentFormOutput } from './equipment-form/equipment-form';
import { ExportComponent } from '../../../shared/export/export';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { Equipment } from '../../../core/models/equipment.model';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [FormsModule, CommonModule, EquipmentFormComponent, ExportComponent],
  templateUrl: './equipment.html',
  styleUrl: './equipment.scss'
})
export class EquipmentComponent {

  private router                   = inject(Router);
  private equipmentService         = inject(EquipmentService);
  private familyService            = inject(EquipmentFamilyService);
  private characteristicValueService = inject(CharacteristicValueService);

  modalOuvert  = false;
  filtreActif  = 'tous';
  recherche    = '';
  familles     = 'toutes'; // 'toutes' ou nameEquipmentFamily
  pageCourante = 1;
  itemsParPage = 10;

  // Signals mutables — chargés via HTTP
  equipements = signal<Equipment[]>([]);
  families    = signal<EquipmentFamily[]>([]);

  constructor() {
    this.chargerEquipements();
    this.chargerFamilles();
  }

  private chargerEquipements(): void {
    this.equipmentService.getAll().subscribe(data => this.equipements.set(data));
  }

  private chargerFamilles(): void {
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  // Liste des noms de familles pour le filtre dropdown
  get famillesDisponibles(): string[] {
    return ['toutes', ...this.families().map(f => f.nameEquipmentFamily)];
  }

  get equipementsFiltres() {
    return this.equipements().filter(e => {
      const matchStatut    = this.filtreActif === 'tous'
        || (this.filtreActif === 'OUT_OF_SERVICE'
            ? (e.status === 'OUT_OF_SERVICE' || e.status === 'UNDER_REPAIR')
            : e.status === this.filtreActif);
      const matchRecherche = e.equipmentName.toLowerCase().includes(this.recherche.toLowerCase());
      const matchFamille   = this.familles === 'toutes'
        || e.equipmentFamily.nameEquipmentFamily === this.familles;
      return matchStatut && matchRecherche && matchFamille;
    });
  }

  get totalPages()       { return Math.ceil(this.equipementsFiltres.length / this.itemsParPage); }
  get debutIndex()       { return (this.pageCourante - 1) * this.itemsParPage + 1; }
  get finIndex()         { return Math.min(this.pageCourante * this.itemsParPage, this.equipementsFiltres.length); }
  get pages(): number[]  { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  get equipementsPagines() {
    const debut = (this.pageCourante - 1) * this.itemsParPage;
    return this.equipementsFiltres.slice(debut, debut + this.itemsParPage);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.pageCourante = page;
  }

  onFiltreChange(): void { this.pageCourante = 1; }

  get totalTous()        { return this.equipements().length; }
  get totalDisponibles() { return this.equipements().filter(e => e.status === 'DISPONIBLE').length; }
  get totalEnPret()      { return this.equipements().filter(e => e.status === 'EN_PRET').length; }
  get totalHorsService() { return this.equipements().filter(e => e.status === 'OUT_OF_SERVICE' || e.status === 'UNDER_REPAIR').length; }

  get equipementsExport() {
    return this.equipements().map(e => ({
      nom:          e.equipmentName,
      reference:    e.reference,
      famille:      e.equipmentFamily.nameEquipmentFamily,
      localisation: e.location ?? '—',
      statut:       this.getStatutLabel(e.status ?? ''),
    }));
  }

  ouvrirModal(): void { this.modalOuvert = true; }
  fermerModal(): void { this.modalOuvert = false; }

  // 1. POST /equipment → récupère l'équipement créé avec son id
  // 2. Pour chaque caractéristique : POST /characteristic-value avec l'id de l'équipement
  // forkJoin attend que tous les POSTs soient terminés avant de recharger
  onAjouter(output: EquipmentFormOutput): void {
    this.equipmentService.create(output.payload).pipe(
      switchMap(createdEquipment => {
        if (output.caracteristiques.length === 0) return of(null);
        return forkJoin(
          output.caracteristiques.map(c =>
            this.characteristicValueService.create({
              value:            c.value,
              characteristicId: c.characteristicId!,
              equipmentId:      createdEquipment.id,
            })
          )
        );
      })
    ).subscribe(() => {
      this.chargerEquipements();
      this.chargerFamilles();
      this.fermerModal();
      this.onFiltreChange();
      this.router.navigate(['/equipements']);
    });
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/equipements', id]);
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
}
