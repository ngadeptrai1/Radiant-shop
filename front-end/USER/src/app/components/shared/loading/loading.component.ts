import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div *ngIf="message" class="loading-message mt-2">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .loading-container-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-message {
      color: #666;
      font-size: 14px;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
      color: #ed145b !important;
    }
  `]
})
export class LoadingComponent {
  @Input() message?: string;
  @Input() overlay: boolean = false;

  get containerClass(): string {
    return this.overlay ? 'loading-container-overlay' : 'loading-container';
  }
} 