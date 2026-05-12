import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss'
})
export class UserLayoutComponent {
  private authService = inject(AuthService);

  initials  = this.authService.initials;
  fullName  = this.authService.fullName;
  roleLabel = this.authService.roleLabel;
}