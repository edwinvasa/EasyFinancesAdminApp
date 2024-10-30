import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-rate-types',
  templateUrl: './rate-types.component.html'
})
export class RateTypesComponent implements OnInit {

  @Input() isLoading: boolean = false;
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() showModal = new EventEmitter<{ title: string, message: string, type: string, action?: Function }>();

  newRateTypeName: string = '';
  rateTypes: any[] = [];
  originalRateTypes: any[] = [];

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.getRateTypes();
  }

  // Obtener tipos de tasas
  getRateTypes() {
    this.loadingChange.emit(true);
    this.adminService.getRateTypes().subscribe({
      next: (data) => {
        this.rateTypes = data.map((rateType: any) => ({
          ...rateType,
          editing: false
        }));
        this.originalRateTypes = JSON.parse(JSON.stringify(this.rateTypes));
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al obtener los tipos de tasas:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo obtener los tipos de tasas.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Crear nuevo tipo de tasa
  onCreateRateType() {
    this.loadingChange.emit(true);
    this.adminService.createRateType(this.newRateTypeName).subscribe({
      next: () => {
        this.newRateTypeName = '';
        this.getRateTypes();
        this.showModal.emit({ title: 'Éxito', message: 'El tipo de tasa se creó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al crear el tipo de tasa:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo crear el tipo de tasa.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Actualizar tipo de tasa
  onUpdateRateType(rateType: any) {
    this.loadingChange.emit(true);
    this.adminService.updateRateType(rateType.id, rateType.name).subscribe({
      next: () => {
        rateType.editing = false;
        this.getRateTypes();
        this.showModal.emit({ title: 'Éxito', message: 'El tipo de tasa se actualizó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al actualizar el tipo de tasa:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo actualizar el tipo de tasa.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Habilitar la edición del tipo de tasa
  enableEditRateType(rateType: any) {
    rateType.editing = true;
  }

  // Cancelar la edición del tipo de tasa
  cancelEditRateType(rateType: any) {
    const originalRateType = this.originalRateTypes.find(rt => rt.id === rateType.id);
    if (originalRateType) {
      rateType.name = originalRateType.name;
    }
    rateType.editing = false;
  }

  // Eliminar tipo de tasa
  onDeleteRateType(id: number) {
    // Mostrar el modal de confirmación con la acción de eliminación
    this.showModal.emit({
      title: 'Confirmación',
      message: '¿Está seguro de que desea eliminar este tipo de tasa?',
      type: 'confirm',
      action: () => {
        this.executeDeleteRateType(id);
      }
    });
  }

  // Ejecutar la eliminación del tipo de tasa
  private executeDeleteRateType(id: number) {
    this.loadingChange.emit(true);
    this.adminService.deleteRateType(id).subscribe({
      next: () => {
        this.getRateTypes();
        this.showModal.emit({ title: 'Éxito', message: 'El tipo de tasa se eliminó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al eliminar el tipo de tasa:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo eliminar el tipo de tasa.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Refrescar tipos de tasas
  refreshRateTypes() {
    this.getRateTypes();
  }
}
