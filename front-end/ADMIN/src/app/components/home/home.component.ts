import { Component } from '@angular/core';
import { ContentComponent } from '../content/content.component';
import { SlideBarComponent } from '../slide-bar/slide-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ContentComponent, SlideBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
