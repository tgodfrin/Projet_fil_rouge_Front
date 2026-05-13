import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/gestionnaire/_layout/layout';
import { UserLayoutComponent } from './pages/utilisateur/_layout/user-layout';
import { DashboardComponent } from './pages/gestionnaire/dashboard/dashboard';
import { EquipmentComponent } from './pages/gestionnaire/equipment/equipment';
import { EquipmentDetailComponent } from './pages/gestionnaire/equipment-detail/equipment-detail';
import { LoanComponent } from './pages/gestionnaire/loan/loan';
import { UserListComponent } from './pages/gestionnaire/user-list/user-list';
import { UserDetailComponent } from './pages/gestionnaire/user-detail/user-detail';
import { UserCreateComponent } from './pages/gestionnaire/user-create/user-create';
import { LoanDetailComponent } from './pages/gestionnaire/loan-detail/loan-detail';
import { PlanningComponent } from './pages/gestionnaire/planning/planning';
import { AlertListComponent } from './pages/gestionnaire/alert-list/alert-list';
import { CategoryListComponent } from './pages/gestionnaire/category-list/category-list';
import { UserHomeComponent } from './pages/utilisateur/user-home/user-home';
import { UserCatalogueComponent } from './pages/utilisateur/user-catalogue/user-catalogue';
import { UserCatalogueDetailComponent } from './pages/utilisateur/user-catalogue-detail/user-catalogue-detail';
import { UserLoansComponent } from './pages/utilisateur/user-loans/user-loans';
import { UserProfileComponent } from './pages/utilisateur/user-profile/user-profile';
import { UserIncidentComponent } from './pages/utilisateur/user-incident/user-incident';
import { UserLoanRequestComponent } from './pages/utilisateur/user-loan-request/user-loan-request';
import { UserConfirmationComponent } from './pages/utilisateur/user-confirmation/user-confirmation';
import { LoginComponent } from './pages/login/login';
import { NotFoundComponent } from './pages/not-found/not-found';

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
      { path: 'emprunts/:id', component: LoanDetailComponent },
      { path: 'utilisateurs', component: UserListComponent },
      { path: 'utilisateurs/nouveau', component: UserCreateComponent },
      { path: 'utilisateurs/:id', component: UserDetailComponent },
      { path: 'planning', component: PlanningComponent },
      { path: 'alertes', component: AlertListComponent },
      { path: 'categories', component: CategoryListComponent },
    ]
  },
  {
    path: 'utilisateur',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: UserHomeComponent },
      { path: 'catalogue', component: UserCatalogueComponent },
      { path: 'catalogue/:id', component: UserCatalogueDetailComponent },
      { path: 'mes-emprunts', component: UserLoansComponent },
      { path: 'profil', component: UserProfileComponent },
      { path: 'signalement/:id', component: UserIncidentComponent },
      { path: 'nouvelle-demande/:id', component: UserLoanRequestComponent },
      { path: 'confirmation', component: UserConfirmationComponent },
    ]
  },
  { path: '**', component: NotFoundComponent },
];
