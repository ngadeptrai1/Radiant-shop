import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show" *ngIf="modalConfig$ | async as config" tabindex="-1" style="display: block;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" [ngClass]="getHeaderClass(config.type)">
            <h5 class="modal-title">{{config.title}}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <p>{{config.message}}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" [ngClass]="getButtonClass(config.type)" (click)="closeModal()">Đóng</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>
  `,
  styles: [`
    .modal-header.success { background-color: #d4edda; }
    .modal-header.error { background-color: #f8d7da; }
    .modal-header.warning { background-color: #fff3cd; }
    .modal-header.info { background-color: #cce5ff; }
  `]
})
export class ModalComponent {
  modalConfig$ ;

  constructor(private modalService: ModalService) {
    this.modalConfig$ = this.modalService.modalConfig$;
  }

  closeModal() {
    this.modalService.hideModal();
  }

  getHeaderClass(type: string): string {
    return type;
  }

  getButtonClass(type: string): string {
    const classes = {
      'success': 'btn-success',
      'error': 'btn-danger',
      'warning': 'btn-warning',
      'info': 'btn-info'
    };
    return classes[type as keyof typeof classes] || 'btn-secondary';
  }
} 