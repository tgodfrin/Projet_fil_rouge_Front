import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
  memberSince: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent {

  profile = signal<UserProfile>({
    firstName: 'Julie',
    lastName: 'Fontaine',
    email: 'julie.fontaine@mns.fr',
    phone: '06 12 34 56 78',
    role: 'Collaboratrice',
    initials: 'JF',
    memberSince: '2024-09-03'
  });

  stats = signal([
    { label: 'Emprunts effectués', value: 12 },
    { label: 'En cours',           value: 2  },
    { label: 'En attente',         value: 1  },
  ]);

  // ── Formulaires inline ─────────────────────────────────
  activeEdit = signal<'email' | 'phone' | 'password' | null>(null);

  // Email
  newEmail = '';
  confirmEmail = '';

  // Téléphone
  newPhone = '';

  // Mot de passe
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Messages retour
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  toggleEdit(field: 'email' | 'phone' | 'password') {
    if (this.activeEdit() === field) {
      this.closeEdit();
    } else {
      this.activeEdit.set(field);
      this.clearMessages();
    }
  }

  closeEdit() {
    this.activeEdit.set(null);
    this.newEmail = '';
    this.confirmEmail = '';
    this.newPhone = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.clearMessages();
  }

  clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  submitEmail() {
    if (!this.newEmail) {
      this.errorMessage.set('Veuillez saisir un email.');
      return;
    }
    if (this.newEmail !== this.confirmEmail) {
      this.errorMessage.set('Les emails ne correspondent pas.');
      return;
    }
    this.profile.update(p => ({ ...p, email: this.newEmail }));
    this.successMessage.set('Email mis à jour.');
    setTimeout(() => this.closeEdit(), 1500);
  }

  submitPhone() {
    if (!this.newPhone) {
      this.errorMessage.set('Veuillez saisir un numéro.');
      return;
    }
    this.profile.update(p => ({ ...p, phone: this.newPhone }));
    this.successMessage.set('Téléphone mis à jour.');
    setTimeout(() => this.closeEdit(), 1500);
  }

  submitPassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage.set('Tous les champs sont obligatoires.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    // TODO: appel API
    this.successMessage.set('Mot de passe mis à jour.');
    setTimeout(() => this.closeEdit(), 1500);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}