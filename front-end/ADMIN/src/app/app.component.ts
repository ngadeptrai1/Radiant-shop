import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SlideBarComponent } from './components/slide-bar/slide-bar.component';
import { ContentComponent } from './components/content/content.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SlideBarComponent, ContentComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'admin-dashboard';
}
