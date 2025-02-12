import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  isVisible: boolean = false;

  @Output() confirmOrder = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<void>();

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  onConfirm() {
    this.confirmOrder.emit();
    this.hide();
  }

  onCancel() {
    this.cancelOrder.emit();
    this.hide();
  }
}