import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EquipmentFamilyService } from '../../../core/services/equipment-family.service';
import { EquipmentFamily } from '../../../core/models/equipment-family.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryListComponent implements OnInit {

  private familyService = inject(EquipmentFamilyService);
  private fb            = inject(FormBuilder);

  families     = signal<EquipmentFamily[]>([]);
  modalOpen    = signal(false);
  editingId    = signal<number | null>(null); // null = create mode, otherwise rename
  errorMessage = signal<string | null>(null);
  submitting   = signal(false);

  nameForm = this.fb.group({
    nameEquipmentFamily: ['', [Validators.required, Validators.minLength(2)]]
  });

  get name() { return this.nameForm.get('nameEquipmentFamily')!; }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.familyService.getAll().subscribe(data => this.families.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.errorMessage.set(null);
    this.nameForm.reset({ nameEquipmentFamily: '' });
    this.modalOpen.set(true);
  }

  openRename(family: EquipmentFamily): void {
    this.editingId.set(family.id);
    this.errorMessage.set(null);
    this.nameForm.reset({ nameEquipmentFamily: family.nameEquipmentFamily });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (this.nameForm.invalid) {
      this.nameForm.markAllAsTouched();
      return;
    }
    const payload = { nameEquipmentFamily: this.name.value!.trim() };
    const id = this.editingId();
    this.submitting.set(true);

    const request$ = id === null
      ? this.familyService.create(payload)
      : this.familyService.update(id, payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.load();
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
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        // 409 = the family still holds equipment (server-side guard)
        this.errorMessage.set(err.status === 409
          ? `Impossible de supprimer « ${family.nameEquipmentFamily} » : des équipements y sont encore rattachés.`
          : 'Une erreur est survenue lors de la suppression.');
      }
    });
  }
}
