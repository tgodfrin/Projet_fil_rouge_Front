import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EquipmentFamily } from '../../../../core/models/equipment-family.model';
import { EquipmentPayload } from '../../../../core/services/equipment.service';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss'
})
export class EquipmentFormComponent {
  private fb = inject(FormBuilder);

  // Familles passées par le parent (chargées via EquipmentFamilyService)
  @Input() families: EquipmentFamily[] = [];

  @Output() fermer  = new EventEmitter<void>();
  @Output() ajouter = new EventEmitter<EquipmentPayload>();

  form = this.fb.group({
    equipmentName:   ['', Validators.required],
    reference:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    familyId:        ['', Validators.required],
    location:        [''],
    acquisitionDate: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const payload: EquipmentPayload = {
      equipmentName:   val.equipmentName!,
      reference:       val.reference!,
      location:        val.location || null,
      acquisitionDate: val.acquisitionDate || null,
      equipmentFamily: { id: Number(val.familyId) },
    };
    this.ajouter.emit(payload);
    this.form.reset();
  }

  onFermer(): void {
    this.fermer.emit();
  }
}
