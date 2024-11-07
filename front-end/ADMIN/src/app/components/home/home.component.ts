import { Component } from '@angular/core';
import { ContentComponent } from '../content/content.component';
import { SlideBarComponent } from '../slide-bar/slide-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ContentComponent, SlideBarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
