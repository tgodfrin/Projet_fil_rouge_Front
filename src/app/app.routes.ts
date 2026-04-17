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
import { UserIncidentComponent } from './features/user-incident/user-incident';
import { UserLoanRequestComponent } from './features/user-loan-request/user-loan-request';
import { UserConfirmationComponent } from './features/user-confirmation/user-confirmation';
import { LoginComponent } from './features/login/login';
import { NotFoundComponent } from './features/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
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
      { path: 'signalement/:id', component: UserIncidentComponent },
      { path: 'nouvelle-demande/:id', component: UserLoanRequestComponent },
      { path: 'confirmation', component: UserConfirmationComponent },
    ]
  },
  { path: '**', component: NotFoundComponent },
];