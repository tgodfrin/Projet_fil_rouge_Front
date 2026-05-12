import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  private authService = inject(AuthService);

  menuOpen  = signal(false);
  initials  = this.authService.initials;
  fullName  = this.authService.fullName;
  roleLabel = this.authService.roleLabel;

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}