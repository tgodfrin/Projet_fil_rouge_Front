import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { EquipmentService } from '../../../core/services/equipment.service';
import { CharacteristicValueService } from '../../../core/services/characteristic-value.service';
import { DocService } from '../../../core/services/doc.service';
import { EquipmentStatus } from '../../../core/models/equipment.model';
import { CharacteristicValue } from '../../../core/models/characteristic-value.model';
import { Doc } from '../../../core/models/doc.model';

@Component({
  selector: 'app-user-catalogue-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-catalogue-detail.html',
  styleUrl: './user-catalogue-detail.scss'
})
export class UserCatalogueDetailComponent {

  private route            = inject(ActivatedRoute);
  private router           = inject(Router);
  private equipmentService = inject(EquipmentService);
  private caracteristicService = inject(CharacteristicValueService);
  private docService       = inject(DocService);

  private equipmentId = Number(this.route.snapshot.paramMap.get('id'));

  equipement       = toSignal(this.equipmentService.getById(this.equipmentId));
  characteristics  = toSignal(this.caracteristicService.getByEquipment(this.equipmentId), { initialValue: [] as CharacteristicValue[] });
  docs             = toSignal(this.docService.getByEquipment(this.equipmentId),            { initialValue: [] as Doc[]                });

  getStatusLabel(status: EquipmentStatus | null): string {
    if (!status) return '—';
    const labels: Record<EquipmentStatus, string> = {
      DISPONIBLE:     'Disponible',
      EN_PRET:        'En prêt',
      OUT_OF_SERVICE: 'Hors service',
      UNDER_REPAIR:   'En réparation',
    };
    return labels[status];
  }

  getStatusClass(status: EquipmentStatus | null): string {
    if (!status) return '';
    const classes: Record<EquipmentStatus, string> = {
      DISPONIBLE:     'b-success',
      EN_PRET:        'b-warning',
      OUT_OF_SERVICE: 'b-danger',
      UNDER_REPAIR:   'b-danger',
    };
    return classes[status];
  }

  getCategoryIcon(familyName: string): string {
    const icons: Record<string, string> = {
      'PC': '💻', 'VR': '🥽', 'Tablette': '📱', 'Écran': '🖥️', 'Périphérique': '🖱️',
      'Informatique': '💻', 'Audio': '🎧', 'Réseau': '🌐',
    };
    return icons[familyName] ?? '📦';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  retour(): void {
    this.router.navigate(['/utilisateur/catalogue']);
  }

  // Redirige vers le catalogue en passant l'id de l'équipement dans le router state
  // Le catalogue peut lire history.state.preselectedId pour pré-sélectionner cet équipement
  borrow(): void {
    this.router.navigate(['/utilisateur/catalogue'], {
      state: { preselectedId: this.equipmentId }
    });
  }
}
