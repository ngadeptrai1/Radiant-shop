import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalConfig = new BehaviorSubject<ModalConfig | null>(null);
  modalConfig$ = this.modalConfig.asObservable();

  showModal(config: ModalConfig) {
    this.modalConfig.next(config);
  }

  hideModal() {
    this.modalConfig.next(null);
  }
} 