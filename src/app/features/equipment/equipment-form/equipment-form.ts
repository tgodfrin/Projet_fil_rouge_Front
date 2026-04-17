import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, CommonModule],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss'
})
export class EquipmentFormComponent {

  @Output() fermer  = new EventEmitter<void>();
  @Output() ajouter = new EventEmitter<Equipement>();

  famillesDisponibles = ['PC', 'VR', 'Tablette', 'Écran', 'Audio', 'Périphérique'];
  statutsDisponibles  = [
    { value: 'disponible',   label: 'Disponible'   },
    { value: 'en-pret',      label: 'En prêt'      },
    { value: 'hors-service', label: 'Hors service' },
  ];

  typesComposants = ['RAM', 'Stockage', 'Écran', 'Processeur', 'Batterie', 'Connectivité', 'Autre'];

  form: Equipement = {
    nom:          '',
    reference:    '',
    famille:      '',
    localisation: '',
    statut:       'disponible',
    composants:   [],
  };

  erreurs: Partial<Record<keyof Omit<Equipement, 'composants'>, string>> = {};

  ajouterComposant(): void {
    this.form.composants.push({ type: '', valeur: '' });
  }

  supprimerComposant(index: number): void {
    this.form.composants.splice(index, 1);
  }

  valider(): boolean {
    this.erreurs = {};
    if (!this.form.nom.trim())          this.erreurs.nom          = 'Le nom est requis.';
    if (!this.form.reference.trim())    this.erreurs.reference    = 'La référence est requise.';
    if (!this.form.famille)             this.erreurs.famille      = 'La famille est requise.';
    if (!this.form.localisation.trim()) this.erreurs.localisation = 'La localisation est requise.';
    return Object.keys(this.erreurs).length === 0;
  }

  onSubmit(): void {
    if (!this.valider()) return;
    // On n'envoie que les composants remplis
    const composantsFiltres = this.form.composants.filter(c => c.type && c.valeur.trim());
    this.ajouter.emit({ ...this.form, composants: composantsFiltres });
    this.fermer.emit();
  }

  onFermer(): void {
    this.fermer.emit();
  }
}
