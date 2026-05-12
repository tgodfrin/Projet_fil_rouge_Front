import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryListComponent {

  private familyService = inject(EquipmentFamilyService);

  // Liste mutable — rechargée après chaque mutation
  families = signal<EquipmentFamily[]>([]);

  // Recherche
  recherche = signal<string>('');

  // Modal création
  modalOuvert = signal<boolean>(false);
  nouveauNom  = signal<string>('');

  // Édition inline : id de la famille en cours d'édition
  editId    = signal<number | null>(null);
  editNom   = signal<string>('');

  // Feedback
  erreur  = signal<string>('');
  succes  = signal<string>('');

  constructor() {
    this.chargerFamilles();
  }

  private chargerFamilles(): void {
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  famillesFiltrees = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    if (!q) return this.families();
    return this.families().filter(f =>
      f.nameEquipmentFamily.toLowerCase().includes(q)
    );
  });

  // --- Création ---

  ouvrirModal(): void {
    this.nouveauNom.set('');
    this.erreur.set('');
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
    this.nouveauNom.set('');
    this.erreur.set('');
  }

  creer(): void {
    const nom = this.nouveauNom().trim();
    if (!nom) { this.erreur.set('Le nom ne peut pas être vide.'); return; }

    this.familyService.create({ nameEquipmentFamily: nom }).subscribe({
      next: () => {
        this.fermerModal();
        this.afficherSucces('Famille créée avec succès.');
        this.chargerFamilles();
      },
      error: () => this.erreur.set('Erreur lors de la création.')
    });
  }

  // --- Édition inline ---

  commencerEdition(family: EquipmentFamily): void {
    this.editId.set(family.id);
    this.editNom.set(family.nameEquipmentFamily);
    this.erreur.set('');
  }

  annulerEdition(): void {
    this.editId.set(null);
    this.editNom.set('');
  }

  sauvegarder(family: EquipmentFamily): void {
    const nom = this.editNom().trim();
    if (!nom) { this.erreur.set('Le nom ne peut pas être vide.'); return; }

    this.familyService.update(family.id, { nameEquipmentFamily: nom }).subscribe({
      next: () => {
        this.annulerEdition();
        this.afficherSucces('Famille mise à jour.');
        this.chargerFamilles();
      },
      error: () => this.erreur.set('Erreur lors de la mise à jour.')
    });
  }

  // --- Suppression ---

  supprimer(family: EquipmentFamily): void {
    if (!confirm(`Supprimer la famille "${family.nameEquipmentFamily}" ?`)) return;

    this.familyService.delete(family.id).subscribe({
      next: () => {
        this.afficherSucces('Famille supprimée.');
        this.chargerFamilles();
      },
      error: () => this.erreur.set('Impossible de supprimer — des équipements y sont peut-être rattachés.')
    });
  }

  // --- Helpers ---

  private afficherSucces(msg: string): void {
    this.succes.set(msg);
    setTimeout(() => this.succes.set(''), 3000);
  }

  onRechercheChange(event: Event): void {
    this.recherche.set((event.target as HTMLInputElement).value);
  }
}
