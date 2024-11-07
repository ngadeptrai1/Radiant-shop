import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-slide-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './slide-bar.component.html',
  styleUrl: './slide-bar.component.scss',
})
export class SlideBarComponent {}
