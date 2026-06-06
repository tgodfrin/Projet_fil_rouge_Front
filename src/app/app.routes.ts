import { Routes } from '@angular/router';
import { authGuard }         from './core/guards/auth.guard';
import { gestionnaireGuard } from './core/guards/gestionnaire.guard';
import { userGuard }         from './core/guards/user.guard';

// Chaque page est chargée à la demande (lazy loading) : le code d'un écran n'est téléchargé
// que lorsque l'utilisateur y accède, ce qui allège le bundle initial.
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'mentions', loadComponent: () => import('./pages/mentions/mentions').then(m => m.MentionsComponent) },
  {
    path: '',
    loadComponent: () => import('./pages/gestionnaire/_layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard, gestionnaireGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/gestionnaire/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'equipements', loadComponent: () => import('./pages/gestionnaire/equipment/equipment').then(m => m.EquipmentComponent) },
      { path: 'equipements/:id', loadComponent: () => import('./pages/gestionnaire/equipment-detail/equipment-detail').then(m => m.EquipmentDetailComponent) },
      { path: 'categories', loadComponent: () => import('./pages/gestionnaire/category-list/category-list').then(m => m.CategoryListComponent) },
      { path: 'emprunts', loadComponent: () => import('./pages/gestionnaire/loan/loan').then(m => m.LoanComponent) },
      { path: 'emprunts/:id', loadComponent: () => import('./pages/gestionnaire/loan-detail/loan-detail').then(m => m.LoanDetailComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./pages/gestionnaire/user-list/user-list').then(m => m.UserListComponent) },
      { path: 'utilisateurs/nouveau', loadComponent: () => import('./pages/gestionnaire/user-create/user-create').then(m => m.UserCreateComponent) },
      { path: 'utilisateurs/:id', loadComponent: () => import('./pages/gestionnaire/user-detail/user-detail').then(m => m.UserDetailComponent) },
      { path: 'utilisateurs/:id/edit', loadComponent: () => import('./pages/gestionnaire/user-create/user-create').then(m => m.UserCreateComponent) },
      { path: 'planning', loadComponent: () => import('./pages/gestionnaire/planning/planning').then(m => m.PlanningComponent) },
      { path: 'alertes', loadComponent: () => import('./pages/gestionnaire/alert-list/alert-list').then(m => m.AlertListComponent) },
      { path: 'profil', loadComponent: () => import('./pages/gestionnaire/gestionnaire-profile/gestionnaire-profile').then(m => m.GestionnaireProfileComponent) },
    ]
  },
  {
    path: 'utilisateur',
    loadComponent: () => import('./pages/utilisateur/_layout/user-layout').then(m => m.UserLayoutComponent),
    canActivate: [authGuard, userGuard],
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', loadComponent: () => import('./pages/utilisateur/user-home/user-home').then(m => m.UserHomeComponent) },
      { path: 'catalogue', loadComponent: () => import('./pages/utilisateur/user-catalogue/user-catalogue').then(m => m.UserCatalogueComponent) },
      { path: 'catalogue/:id', loadComponent: () => import('./pages/utilisateur/user-catalogue-detail/user-catalogue-detail').then(m => m.UserCatalogueDetailComponent) },
      { path: 'mes-emprunts', loadComponent: () => import('./pages/utilisateur/user-loans/user-loans').then(m => m.UserLoansComponent) },
      { path: 'profil', loadComponent: () => import('./pages/utilisateur/user-profile/user-profile').then(m => m.UserProfileComponent) },
      { path: 'signalement/:id', loadComponent: () => import('./pages/utilisateur/user-incident/user-incident').then(m => m.UserIncidentComponent) },
      { path: 'recapitulatif', loadComponent: () => import('./pages/utilisateur/user-loan-summary/user-loan-summary').then(m => m.UserLoanSummaryComponent) },
      { path: 'confirmation', loadComponent: () => import('./pages/utilisateur/user-confirmation/user-confirmation').then(m => m.UserConfirmationComponent) },
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent) },
];
