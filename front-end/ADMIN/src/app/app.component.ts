import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SlideBarComponent } from './components/slide-bar/slide-bar.component';
import { HeaderComponent } from "./components/header/header.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { FooterComponent } from "./components/footer/footer.component";
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SlideBarComponent, HeaderComponent, MatPaginatorModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    BrowserModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDatepickerModule,
  ],
})
export class AppComponent {
  title = 'admin-dashboard';
}
