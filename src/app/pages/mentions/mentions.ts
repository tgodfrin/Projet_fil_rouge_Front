import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mentions.html',
  styleUrl: './mentions.scss'
})
export class MentionsComponent {}
