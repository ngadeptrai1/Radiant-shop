import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { SlideBarComponent } from '../slide-bar/slide-bar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    HomeComponent,
    SlideBarComponent,
    HeaderComponent,
    FooterComponent,
    LogoutModalComponent,
  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss',
})
export class ChartsComponent {}
