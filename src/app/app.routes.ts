import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { EquipmentComponent } from './features/equipment/equipment';
import { EquipmentDetailComponent } from './features/equipment-detail/equipment-detail';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'equipements',
        component: EquipmentComponent
      },
      {
        path: 'equipements/:id',
        component: EquipmentDetailComponent
      }
    ]
  }
];