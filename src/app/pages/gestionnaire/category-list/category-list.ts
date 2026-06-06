import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { ProfilService } from '../../../core/services/profil.service';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';
import { Equipment } from '../../../core/models/equipment.model';
import { Profil, ProfilType } from '../../../core/models/profil.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryListComponent implements OnInit {

  private familyService    = inject(EquipmentFamilyService);
  private profilService    = inject(ProfilService);
  private equipmentService = inject(EquipmentService);
  private fb               = inject(FormBuilder);

  families     = signal<EquipmentFamily[]>([]);
  private equipments = signal<Equipment[]>([]);
  modalOpen    = signal(false);
  editingId    = signal<number | null>(null); // null = create mode, otherwise edit
  errorMessage = signal<string | null>(null);
  submitting   = signal(false);

  // Profils chargés depuis /profil/list, utilisés pour les cases à cocher et leur pré-remplissage.
  private allProfils = signal<Profil[]>([]);
  // Rôles proposés pour les droits d'emprunt : le gestionnaire gère le parc et n'emprunte pas.
  borrowableProfils  = computed(() => this.allProfils().filter(p => p.type !== 'GESTIONNAIRE'));

  // Identifiants des profils cochés dans la fenêtre.
  selectedProfilIds = signal<number[]>([]);

  nameForm = this.fb.group({
    nameEquipmentFamily: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
  });

  get name() { return this.nameForm.get('nameEquipmentFamily')!; }

  private readonly roleLabels: Record<ProfilType, string> = {
    GESTIONNAIRE:  'Gestionnaire',
    COLLABORATEUR: 'Collaborateur',
    INTERVENANT:   'Intervenant',
    STAGIAIRE:     'Stagiaire'
  };

  roleLabel(type: ProfilType): string {
    return this.roleLabels[type];
  }

  ngOnInit(): void {
    this.loadFamilies();
    this.loadProfils();
    this.loadEquipments();
  }

  private loadFamilies(): void {
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  private loadProfils(): void {
    this.profilService.getAll().subscribe(data => this.allProfils.set(data));
  }

  private loadEquipments(): void {
    this.equipmentService.getAll().subscribe(data => this.equipments.set(data));
  }

  // Number of equipment items belonging to a given family
  countFor(familyId: number): number {
    return this.equipments().filter(e => e.equipmentFamily?.id === familyId).length;
  }

  openCreate(): void {
    this.editingId.set(null);
    this.errorMessage.set(null);
    this.nameForm.reset({ nameEquipmentFamily: '' });
    this.selectedProfilIds.set([]);
    this.modalOpen.set(true);
  }

  openRename(family: EquipmentFamily): void {
    this.editingId.set(family.id);
    this.errorMessage.set(null);
    this.nameForm.reset({ nameEquipmentFamily: family.nameEquipmentFamily });
    // Prefill: profils whose can_loan list already contains this family
    const allowed = this.allProfils()
      .filter(p => p.equipmentFamilies.some(f => f.id === family.id))
      .map(p => p.id);
    this.selectedProfilIds.set(allowed);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  isProfilChecked(id: number): boolean {
    return this.selectedProfilIds().includes(id);
  }

  toggleProfil(id: number): void {
    const current = this.selectedProfilIds();
    this.selectedProfilIds.set(
      current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    );
  }

  save(): void {
    if (this.nameForm.invalid) {
      this.nameForm.markAllAsTouched();
      return;
    }
    const payload = { nameEquipmentFamily: this.name.value!.trim() };
    const id = this.editingId();
    const profilIds = this.selectedProfilIds();
    this.submitting.set(true);

    // La création renvoie la nouvelle famille (avec son id) ; la mise à jour renvoie 204 sans contenu,
    // donc en édition on réutilise l'id connu plutôt que la réponse.
    const chain$ = id === null
      ? this.familyService.create(payload).pipe(
          switchMap(family => this.familyService.setProfils(family.id, profilIds)))
      : this.familyService.update(id, payload).pipe(
          switchMap(() => this.familyService.setProfils(id, profilIds)));

    chain$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadFamilies();
        this.loadProfils(); // les associations ont changé, on rafraîchit la source de pré-remplissage
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  confirmDelete(family: EquipmentFamily): void {
    const ok = window.confirm(`Supprimer la catégorie « ${family.nameEquipmentFamily} » ?`);
    if (!ok) return;

    this.errorMessage.set(null);
    this.familyService.delete(family.id).subscribe({
      next: () => this.loadFamilies(),
      error: (err: HttpErrorResponse) => {
        // 409 : la famille contient encore du matériel (garde-fou côté serveur).
        this.errorMessage.set(err.status === 409
          ? `Impossible de supprimer « ${family.nameEquipmentFamily} » : des équipements y sont encore rattachés.`
          : 'Une erreur est survenue lors de la suppression.');
      }
    });
  }
}
