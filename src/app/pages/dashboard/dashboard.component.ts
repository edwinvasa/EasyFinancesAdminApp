import { Component, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  isLoading: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: string = '';
  modalAction: Function | null = null;
  
  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    const tabContainer = this.elementRef.nativeElement.querySelector('#adminTab');
    tabContainer?.addEventListener('shown.bs.tab', (event: any) => {
      const activeTab = event.target.getAttribute('aria-controls');
    });

    // Detectar cambios después de la vista inicial
    this.cdr.detectChanges();
  }

  // Mostrar el modal
  showModal(title: string, message: string, type: string, action?: Function) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;

    if (action) {
      this.modalAction = action;
    }

    const modalElement = document.getElementById('infoModal') as HTMLElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Confirmar acción del modal
  confirmModalAction() {
    if (this.modalAction) {
      this.modalAction();
    } else {
      console.log('No hay acción definida para el modal.');
    }
    this.modalAction = null;
  
    const modalElement = document.getElementById('infoModal') as HTMLElement;
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }

  // Método para manejar el estado de carga
  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;

    // Usar una detección de cambios asíncrona para evitar errores de expresión
    setTimeout(() => {
      this.cdr.markForCheck();
    });
  }
}
