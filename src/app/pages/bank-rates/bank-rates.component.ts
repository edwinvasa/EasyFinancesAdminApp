import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-bank-rates',
  templateUrl: './bank-rates.component.html'
})
export class BankRatesComponent implements OnInit {

  @Input() isLoading: boolean = false;
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() showModal = new EventEmitter<{ title: string, message: string, type: string, action?: Function }>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  bankName: string = '';
  selectedFileName: string = '';
  interesRate!: number;
  maxInteresRate!: number;
  bankInterestRates: any[] = [];
  filteredBankInterestRates: any[] = [];
  searchBankName: string = '';
  newRate = { bankName: '', interesRate: 0, maxInteresRate: 0 };
  batchBankRates: any[] = [];

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.getBankInterestRates();
  }
  
  // Iniciar el scraping
  startScraping() {
    this.isLoading = true;
    this.adminService.updateBankRates().subscribe({
      next: (data) => {
        this.bankInterestRates = data;
        this.getBankInterestRates();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al iniciar el scraping:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo obtener las tasas de interés bancarias.', type: 'error' });
        this.isLoading = false;
      }
    });
  }

  // Refrescar manualmente la tabla de tasas de interés bancarias
  refreshBankInterestRates() {
    this.getBankInterestRates();
  }

  // Obtener tasas de interés bancarias
  getBankInterestRates() {
    this.loadingChange.emit(true);
    this.adminService.getBankInterestRates().subscribe({
      next: (data) => {
        this.bankInterestRates = data.map((rate: any) => ({
          ...rate,
          editing: false
        }));
        this.filteredBankInterestRates = data;
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al obtener las tasas de interés bancarias:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo obtener las tasas de interés bancarias.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Crear una tasa de interés bancaria
  onCreateBankInterestRate() {
    this.loadingChange.emit(true);
    this.adminService.createOrUpdateBankInterestRate(this.bankName, this.interesRate, this.maxInteresRate).subscribe({
      next: () => {
        this.bankName = '';
        this.interesRate = 0;
        this.maxInteresRate = 0;
        this.getBankInterestRates();
        this.showModal.emit({ title: 'Éxito', message: 'La tasa de interés bancaria se creó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al crear/actualizar la tasa de interés bancaria:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo crear/actualizar la tasa de interés bancaria.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Añadir una nueva tasa al lote
  addRate() {
    if (this.newRate.bankName && this.newRate.interesRate && this.newRate.maxInteresRate) {
      this.batchBankRates.push({ ...this.newRate });
      this.resetNewRate();
    }
  }

  // Resetear el formulario de nueva tasa
  resetNewRate() {
    this.newRate = { bankName: '', interesRate: 0, maxInteresRate: 0 };
  }

  // Eliminar una tasa del lote
  removeRate(index: number) {
    this.batchBankRates.splice(index, 1);
  }

  // Procesar lote de tasas de interés bancarias
  onSubmitBatch() {
    if (this.batchBankRates.length > 0) {
      this.loadingChange.emit(true);
      this.adminService.createOrUpdateBankInterestRatesBatch(this.batchBankRates).subscribe({
        next: () => {
          this.batchBankRates = [];
          this.getBankInterestRates();
          this.showModal.emit({ title: 'Éxito', message: 'El lote de tasas de interés bancarias se procesó correctamente.', type: 'success' });
          this.resetFileInput();
          this.loadingChange.emit(false);
        },
        error: (err) => {
          console.error('Error al procesar el lote de tasas de interés bancarias:', err);
          this.showModal.emit({ title: 'Error', message: 'No se pudo procesar el lote de tasas de interés bancarias.', type: 'error' });
          this.loadingChange.emit(false);
        }
      });
    }
  }

  // Manejar la carga de archivo
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvData = e.target.result;
        this.parseCSV(csvData);
      };
      reader.readAsText(file);
    }
  }

  resetFileInput() {
    this.fileInput.nativeElement.value = '';
    this.selectedFileName = '';
  }

  // Parsear el contenido del CSV y actualizar la tabla de batchBankRates
  parseCSV(data: string) {
    const rows = data.split('\n');
    const headers = rows[0].split(',');

    if (headers[0].trim() === 'Nombre del Banco' && headers[1].trim() === 'Tasa de Interés' && headers[2].trim() === 'Tasa Máxima de Interés') {
      this.batchBankRates = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (cols.length === 3) {
          this.batchBankRates.push({
            bankName: cols[0].trim(),
            interesRate: parseFloat(cols[1].trim()),
            maxInteresRate: parseFloat(cols[2].trim())
          });
        }
      }
    } else {
      this.showModal.emit({ title: 'Error', message: 'El archivo CSV tiene un formato incorrecto.', type: 'error' });
    }
  }

  // Filtrar tasas de interés bancarias por nombre del banco
  filterBankInterestRates() {
    this.filteredBankInterestRates = this.bankInterestRates.filter(rate =>
      rate.bankName.toLowerCase().includes(this.searchBankName.toLowerCase())
    );
  }

  // Actualizar una tasa de interés bancaria
  onUpdateBankInterestRate(rate: any) {
    this.loadingChange.emit(true);
    this.adminService.createOrUpdateBankInterestRate(rate.bankName, rate.interestRate, rate.maxInterestRate).subscribe({
      next: () => {
        rate.editing = false;
        this.getBankInterestRates();
        this.showModal.emit({ title: 'Éxito', message: 'La tasa de interés bancaria se actualizó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al actualizar la tasa de interés bancaria:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo actualizar la tasa de interés bancaria.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Eliminar una tasa de interés bancaria
  onDeleteBankInterestRate(id: string) {
    const actionToExecute = () => {
      this.executeDeleteBankInterestRate(id);
    };

    // Emitir el evento con la acción definida
    this.showModal.emit({
      title: 'Confirmación',
      message: '¿Está seguro de que desea eliminar esta tasa de interés bancaria?',
      type: 'confirm',
      action: actionToExecute
    });
  }

  // Ejecutar la eliminación de la tasa de interés bancaria
  private executeDeleteBankInterestRate(id: string) {
    this.loadingChange.emit(true);
    this.adminService.deleteBankInterestRate(id).subscribe({
      next: () => {
        console.log('Tasa de interés bancaria eliminada con éxito');
        this.getBankInterestRates();
        this.showModal.emit({ title: 'Éxito', message: 'La tasa de interés bancaria se eliminó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al eliminar la tasa de interés bancaria:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo eliminar la tasa de interés bancaria.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Cancelar la edición de una tasa de interés bancaria
  cancelEditBankInterestRate(rate: any) {
    rate.editing = false;
    this.getBankInterestRates();
  }

  // Verificar si hay tasas seleccionadas
  hasSelectedRates(): boolean {
    return this.filteredBankInterestRates.some(rate => rate.selected);
  }

  // Alternar selección de todos los elementos
  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.filteredBankInterestRates.forEach(rate => rate.selected = isChecked);
  }

  // Eliminar tasas seleccionadas
  deleteSelectedRates() {
    const selectedRates = this.filteredBankInterestRates.filter(rate => rate.selected);
    if (selectedRates.length > 0) {
      const actionToExecute = () => {
        const idsToDelete = selectedRates.map(rate => rate.id);
        this.executeDeleteBatch(idsToDelete);
      };

      // Mostrar modal de confirmación
      this.showModal.emit({
        title: 'Confirmación',
        message: '¿Está seguro de que desea eliminar las tasas de interés seleccionadas?',
        type: 'confirm',
        action: actionToExecute
      });
    }
  }

  // Ejecutar eliminación en lote, una por una
  private executeDeleteBatch(ids: string[]) {
    this.loadingChange.emit(true);
    let completed = 0;
    let hasErrors = false;

    ids.forEach(id => {
      this.adminService.deleteBankInterestRate(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.finalizeBatchDeletion(hasErrors);
          }
        },
        error: (err) => {
          console.error(`Error al eliminar la tasa con ID: ${id}`, err);
          hasErrors = true;
          completed++;
          if (completed === ids.length) {
            this.finalizeBatchDeletion(hasErrors);
          }
        }
      });
    });
  }

  // Finalizar la eliminación en lote
  private finalizeBatchDeletion(hasErrors: boolean) {
    this.getBankInterestRates();
    this.loadingChange.emit(false);
    
    if (hasErrors) {
      this.showModal.emit({ title: 'Error', message: 'No se pudieron eliminar algunas tasas de interés.', type: 'error' });
    } else {
      this.showModal.emit({ title: 'Éxito', message: 'Las tasas seleccionadas se eliminaron correctamente.', type: 'success' });
    }
  }
}
