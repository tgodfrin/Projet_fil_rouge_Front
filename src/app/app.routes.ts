import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { EquipmentComponent } from './features/equipment/equipment';
import { EquipmentDetailComponent } from './features/equipment-detail/equipment-detail';
import { LoanComponent } from './features/loan/loan';
import { UserListComponent } from './features/user-list/user-list';
import { PlanningComponent } from './features/planning/planning';
import { AlertListComponent } from './features/alert-list/alert-list';

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
      },
      { 
        path: 'emprunts',
        component: LoanComponent 
      },
      { 
        path: 'utilisateurs', 
        component: UserListComponent
      },
      { 
        path: 'planning',
        component: PlanningComponent
      },
      { 
        path: 'alertes',
        component: AlertListComponent
      },
    ]  
  }
];