import { Component, inject, signal, OnInit } from '@angular/core';
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
export class EquipmentComponent implements OnInit {

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

  // Filtre par date — 'unique' = 1 date picker, 'plage' = 2 date pickers
  dateMode  = signal<'unique' | 'plage'>('unique');
  startDate = signal<string>(this.getTodayString());
  endDate   = signal<string>(this.getTodayString());

  // Signals mutables — chargés via HTTP
  equipements = signal<Equipment[]>([]);
  families    = signal<EquipmentFamily[]>([]);

  // Initial load: apply the default "single date = today" filter so the list renders
  // immediately on screen open, without any user interaction.
  ngOnInit(): void {
    this.dateMode.set('unique');
    this.startDate.set(this.getTodayString());
    this.endDate.set(this.getTodayString());
    this.chargerEquipements();
    this.chargerFamilles();
  }

  private chargerEquipements(): void {
    const start = this.startDate();
    const end   = this.dateMode() === 'plage' ? this.endDate() : undefined;
    this.equipmentService.getAllByDate(start, end).subscribe(data => this.equipements.set(data));
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

  setDateMode(mode: 'unique' | 'plage'): void {
    this.dateMode.set(mode);
    // En passant en mode unique, on remet endDate = startDate pour cohérence
    if (mode === 'unique') this.endDate.set(this.startDate());
    this.chargerEquipements();
    this.onFiltreChange();
  }

  onStartDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startDate.set(value);
    // En mode plage, si endDate < startDate, on ajuste endDate
    if (this.dateMode() === 'plage' && this.endDate() < value) this.endDate.set(value);
    this.chargerEquipements();
    this.onFiltreChange();
  }

  onEndDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endDate.set(value);
    this.chargerEquipements();
    this.onFiltreChange();
  }

  private getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
      this.chargerEquipements(); // recharge avec les dates courantes
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
