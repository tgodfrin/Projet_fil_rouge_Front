import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss'
})
export class UserLayoutComponent {
  menuOpen = signal(false);
  closeMenu(): void { this.menuOpen.set(false); }
}