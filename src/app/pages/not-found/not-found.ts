import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  retourAccueil(): void {
    this.router.navigate(['/login']);
  }
}
