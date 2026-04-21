import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Composant {
  type: string;
  valeur: string;
}

export interface Equipement {
  nom: string;
  reference: string;
  famille: string;
  localisation: string;
  statut: string;
  composants: Composant[];
}

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss'
})
export class EquipmentFormComponent {
  private fb = inject(FormBuilder);

  @Output() fermer  = new EventEmitter<void>();
  @Output() ajouter = new EventEmitter<Equipement>();

  famillesDisponibles = ['PC', 'VR', 'Tablette', 'Écran', 'Audio', 'Périphérique'];
  statutsDisponibles  = [
    { value: 'DISPONIBLE',     label: 'Disponible'      },
    { value: 'EN_PRET',        label: 'En prêt'         },
    { value: 'OUT_OF_SERVICE', label: 'Hors service'    },
    { value: 'UNDER_REPAIR',   label: 'En réparation'   },
  ];
  typesComposants = ['RAM', 'Stockage', 'Écran', 'Processeur', 'Batterie', 'Connectivité', 'Autre'];

  form = this.fb.group({
    nom:          ['', Validators.required],
    reference:    ['', Validators.required],
    famille:      ['', Validators.required],
    localisation: ['', Validators.required],
    statut:       ['DISPONIBLE'],
    composants:   this.fb.array([])
  });

  // ── Accesseur FormArray ────────────────────────────────
  get composants(): FormArray {
    return this.form.get('composants') as FormArray;
  }

  composantGroup(index: number): FormGroup {
    return this.composants.at(index) as FormGroup;
  }

  ajouterComposant(): void {
    this.composants.push(this.fb.group({
      type:  [''],
      valeur: ['']
    }));
  }

  supprimerComposant(index: number): void {
    this.composants.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const composantsFiltres = (val.composants as Composant[])
      .filter(c => c.type && c.valeur?.trim());

    this.ajouter.emit({
      nom:          val.nom!,
      reference:    val.reference!,
      famille:      val.famille!,
      localisation: val.localisation!,
      statut:       val.statut!,
      composants:   composantsFiltres
    });
    this.fermer.emit();
  }

  onFermer(): void {
    this.fermer.emit();
  }
}
