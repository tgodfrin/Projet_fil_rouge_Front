import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}