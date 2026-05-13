import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EquipmentFamily } from '../../../../core/models/equipment-family.model';
import { Equipment } from '../../../../core/models/equipment.model';
import { EquipmentPayload } from '../../../../core/services/equipment.service';
import { CharacteristicService } from '../../../../core/services/characteristic.service';
import { Characteristic } from '../../../../core/models/characteristic-value.model';

export interface CaracteristiqueRow {
  characteristicId: number | null;
  value: string;
}

export interface EquipmentFormOutput {
  payload: EquipmentPayload;
  caracteristiques: CaracteristiqueRow[];
}

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss'
})
export class EquipmentFormComponent implements OnInit {

  private fb                    = inject(FormBuilder);
  private characteristicService = inject(CharacteristicService);

  // Familles passées par le parent (chargées via EquipmentFamilyService)
  @Input() families: EquipmentFamily[] = [];

  // 'create' → formulaire de création  |  'edit' → formulaire pré-rempli sans caractéristiques
  @Input() mode: 'create' | 'edit' = 'create';

  // En mode edit : équipement à pré-remplir dans ngOnInit via patchValue
  @Input() initialEquipment: Equipment | null = null;

  // false → l'overlay n'est pas rendu, le formulaire s'affiche inline dans le flux de la page
  @Input() showOverlay = true;

  @Output() fermer  = new EventEmitter<void>();
  @Output() ajouter = new EventEmitter<EquipmentFormOutput>();

  // Liste des types de caractéristiques disponibles (chargée depuis le back)
  caracteristiquesDisponibles = signal<Characteristic[]>([]);

  // Lignes de caractéristiques ajoutées dynamiquement par le gestionnaire
  lignes = signal<CaracteristiqueRow[]>([]);

  form = this.fb.group({
    equipmentName:   ['', Validators.required],
    reference:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    familyId:        ['', Validators.required],
    location:        [''],
    acquisitionDate: [''],
  });

  ngOnInit(): void {
    this.characteristicService.getAll().subscribe(data => {
      this.caracteristiquesDisponibles.set(data);
    });

    // Pré-remplissage en mode édition
    if (this.mode === 'edit' && this.initialEquipment) {
      const eq = this.initialEquipment;
      this.form.patchValue({
        equipmentName:   eq.equipmentName,
        reference:       eq.reference,
        familyId:        String(eq.equipmentFamily.id),
        location:        eq.location ?? '',
        acquisitionDate: eq.acquisitionDate ?? '',
      });
    }
  }

  ajouterLigne(): void {
    this.lignes.update(rows => [...rows, { characteristicId: null, value: '' }]);
  }

  supprimerLigne(index: number): void {
    this.lignes.update(rows => rows.filter((_, i) => i !== index));
  }

  setCharacteristicId(index: number, id: string): void {
    this.lignes.update(rows =>
      rows.map((row, i) => i === index ? { ...row, characteristicId: Number(id) } : row)
    );
  }

  setValue(index: number, value: string): void {
    this.lignes.update(rows =>
      rows.map((row, i) => i === index ? { ...row, value } : row)
    );
  }

  // Vérifie que chaque ligne a bien un type ET une valeur remplis
  get lignesValides(): boolean {
    return this.lignes().every(row => row.characteristicId !== null && row.value.trim() !== '');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Bloque les lignes incomplètes uniquement en mode create
    if (this.mode === 'create' && !this.lignesValides) return;

    const val = this.form.value;
    const payload: EquipmentPayload = {
      equipmentName:   val.equipmentName!,
      reference:       val.reference!,
      location:        val.location || null,
      acquisitionDate: val.acquisitionDate || null,
      equipmentFamily: { id: Number(val.familyId) },
    };

    // En mode edit, les caractéristiques ne sont pas envoyées (endpoint PUT ne les gère pas)
    this.ajouter.emit({
      payload,
      caracteristiques: this.mode === 'create' ? this.lignes() : [],
    });

    if (this.mode === 'create') {
      this.form.reset();
      this.lignes.set([]);
    }
  }

  onFermer(): void {
    this.fermer.emit();
  }
}
