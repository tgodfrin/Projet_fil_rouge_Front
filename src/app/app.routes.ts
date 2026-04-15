import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { UserLayoutComponent } from './user-layout/user-layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { EquipmentComponent } from './features/equipment/equipment';
import { EquipmentDetailComponent } from './features/equipment-detail/equipment-detail';
import { LoanComponent } from './features/loan/loan';
import { UserListComponent } from './features/user-list/user-list';
import { PlanningComponent } from './features/planning/planning';
import { AlertListComponent } from './features/alert-list/alert-list';
import { UserHomeComponent } from './features/user-home/user-home';
import { UserCatalogueComponent } from './features/user-catalogue/user-catalogue';
import { UserLoansComponent } from './features/user-loans/user-loans';
import { UserProfileComponent } from './features/user-profile/user-profile';
import { UserConfirmationComponent } from './features/user-confirmation/user-confirmation';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'equipements', component: EquipmentComponent },
      { path: 'equipements/:id', component: EquipmentDetailComponent },
      { path: 'emprunts', component: LoanComponent },
      { path: 'utilisateurs', component: UserListComponent },
      { path: 'planning', component: PlanningComponent },
      { path: 'alertes', component: AlertListComponent },
    ]
  },
  {
    path: 'utilisateur',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: UserHomeComponent },
      { path: 'catalogue', component: UserCatalogueComponent },
      { path: 'mes-emprunts', component: UserLoansComponent },
      { path: 'profil', component: UserProfileComponent },
      { path: 'confirmation', component: UserConfirmationComponent },
    ]
  }
];