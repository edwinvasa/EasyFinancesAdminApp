import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BankRatesComponent } from './bank-rates.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('BankRatesComponent', () => {
  let component: BankRatesComponent;
  let fixture: ComponentFixture<BankRatesComponent>;
  let adminService: AdminService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BankRatesComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [AdminService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankRatesComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBankInterestRates on init', () => {
    spyOn(component, 'getBankInterestRates');
    component.ngOnInit();
    expect(component.getBankInterestRates).toHaveBeenCalled();
  });

  it('should set bankInterestRates after calling getBankInterestRates', () => {
    const mockRates = [{ bankName: 'Bank1', interestRate: 3.5, maxInterestRate: 5.0 }];
    spyOn(adminService, 'getBankInterestRates').and.returnValue(of(mockRates));
    
    component.getBankInterestRates();
    expect(component.bankInterestRates).toEqual([{ ...mockRates[0], editing: false }]);
  });

  it('should handle error in getBankInterestRates', () => {
    spyOn(adminService, 'getBankInterestRates').and.returnValue(throwError(() => new Error('Error')));
    spyOn(component.showModal, 'emit');
    
    component.getBankInterestRates();
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo obtener las tasas de interés bancarias.',
      type: 'error'
    });
  });

  it('should create a new bank interest rate', () => {
    spyOn(adminService, 'createOrUpdateBankInterestRate').and.returnValue(of(null));
    spyOn(component, 'getBankInterestRates');

    component.bankName = 'Bank1';
    component.interesRate = 3.5;
    component.maxInteresRate = 5.0;
    
    component.onCreateBankInterestRate();

    expect(component.getBankInterestRates).toHaveBeenCalled();
    expect(component.bankName).toBe('');
    expect(component.interesRate).toBe(0);
    expect(component.maxInteresRate).toBe(0);
  });

  it('should handle error in onCreateBankInterestRate', () => {
    spyOn(adminService, 'createOrUpdateBankInterestRate').and.returnValue(throwError(() => new Error('Error')));
    spyOn(component.showModal, 'emit');

    component.onCreateBankInterestRate();
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo crear/actualizar la tasa de interés bancaria.',
      type: 'error'
    });
  });

  it('should add a new rate to batch', () => {
    component.newRate = { bankName: 'Bank2', interesRate: 4.0, maxInteresRate: 6.0 };
    component.addRate();

    expect(component.batchBankRates.length).toBe(1);
    expect(component.batchBankRates[0].bankName).toBe('Bank2');
  });

  it('should reset new rate form', () => {
    component.newRate = { bankName: 'Bank3', interesRate: 4.5, maxInteresRate: 6.5 };
    component.resetNewRate();

    expect(component.newRate.bankName).toBe('');
    expect(component.newRate.interesRate).toBe(0);
    expect(component.newRate.maxInteresRate).toBe(0);
  });

  it('should handle file upload', (done) => {
    // Simular el contenido del archivo CSV
    const csvContent = 'Nombre del Banco,Tasa de Interés,Tasa Máxima de Interés\nBank4,3.5,5.0';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'test.csv', { type: 'text/csv' });
    const event = { target: { files: [file] } };

    spyOn(component, 'parseCSV').and.callThrough(); // Spy para parseCSV

    // Simular la carga de archivo
    component.onFileChange(event as any);

    // Esperar a que FileReader procese el archivo
    setTimeout(() => {
      expect(component.parseCSV).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should delete a bank interest rate', () => {
    const mockRate = { id: '1', bankName: 'Bank1', interestRate: 3.5, maxInterestRate: 5.0 };
    component.filteredBankInterestRates = [mockRate];
  
    spyOn(adminService, 'deleteBankInterestRate').and.returnValue(of(null));
    spyOn(component.showModal, 'emit').and.callFake((modalData) => {
      // Verificar que modalData esté definido
      if (modalData && modalData.type === 'confirm' && modalData.action) {
        modalData.action(); // Simular la ejecución de la acción de confirmación
      }
    });
  
    component.onDeleteBankInterestRate('1');
  
    expect(adminService.deleteBankInterestRate).toHaveBeenCalledWith('1');
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Éxito',
      message: 'La tasa de interés bancaria se eliminó correctamente.',
      type: 'success'
    });
  });   

  it('should edit a bank interest rate', () => {
    const mockRate = { id: '1', bankName: 'Bank1', interestRate: 4.0, maxInterestRate: 5.0, editing: true };
    component.bankInterestRates = [mockRate];
  
    spyOn(adminService, 'createOrUpdateBankInterestRate').and.returnValue(of(null));
  
    component.onUpdateBankInterestRate(mockRate);
  
    expect(mockRate.editing).toBe(false);
    expect(adminService.createOrUpdateBankInterestRate).toHaveBeenCalledWith('Bank1', 4.0, 5.0);
  });
  

  it('should handle error when editing a bank interest rate', () => {
    const mockRate = { bankName: 'Bank1', interestRate: 4.0, maxInterestRate: 5.0, editing: true };
    spyOn(adminService, 'createOrUpdateBankInterestRate').and.returnValue(throwError(() => new Error('Error')));
    spyOn(component.showModal, 'emit');

    component.onUpdateBankInterestRate(mockRate);

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo actualizar la tasa de interés bancaria.',
      type: 'error'
    });
  });

  it('should delete selected rates and call the admin service', () => {
    component.filteredBankInterestRates = [
      { id: '1', selected: true },
      { id: '2', selected: false }
    ];
  
    spyOn(adminService, 'deleteBankInterestRate').and.returnValue(of(null));
    spyOn(component.showModal, 'emit').and.callFake((modalData) => {
      // Verificar que modalData esté definido
      if (modalData && modalData.type === 'confirm' && modalData.action) {
        modalData.action(); // Simular la ejecución de la acción de confirmación
      }
    });
  
    component.deleteSelectedRates();
  
    expect(adminService.deleteBankInterestRate).toHaveBeenCalledWith('1');
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Éxito',
      message: 'Las tasas seleccionadas se eliminaron correctamente.',
      type: 'success'
    });
  });   

  // Test para la confirmación de eliminación de tasas
  it('should emit showModal event for confirm deletion', () => {
    spyOn(component.showModal, 'emit');
    const mockRate = { id: '1', bankName: 'Bank1', interestRate: 3.5, maxInterestRate: 5.0, editing: false };

    component.onDeleteBankInterestRate(mockRate.id);

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Confirmación',
      message: '¿Está seguro de que desea eliminar esta tasa de interés bancaria?',
      type: 'confirm',
      action: jasmine.any(Function)
    });
  });

  // Test para la selección de todos los elementos
  it('should toggle select all rates', () => {
    component.filteredBankInterestRates = [
      { id: '1', selected: false },
      { id: '2', selected: false }
    ];
    const event = { target: { checked: true } };

    component.toggleSelectAll(event);

    expect(component.filteredBankInterestRates.every(rate => rate.selected)).toBeTrue();
  });

  // Test para cancelar la edición de una tasa de interés bancaria
  it('should cancel editing a bank interest rate', () => {
    const mockRate = { bankName: 'Bank1', interestRate: 4.0, maxInterestRate: 5.0, editing: true };
    component.bankInterestRates = [mockRate];

    component.cancelEditBankInterestRate(mockRate);

    expect(mockRate.editing).toBe(false);
  });

  // Test para verificación de tasas seleccionadas
  it('should return true if there are selected rates', () => {
    component.filteredBankInterestRates = [
      { id: '1', selected: true },
      { id: '2', selected: false }
    ];

    expect(component.hasSelectedRates()).toBeTrue();
  });

  it('should return false if there are no selected rates', () => {
    component.filteredBankInterestRates = [
      { id: '1', selected: false },
      { id: '2', selected: false }
    ];

    expect(component.hasSelectedRates()).toBeFalse();
  });

  // Test para la carga de archivos
  it('should parse CSV data correctly', () => {
    const csvData = 'Nombre del Banco,Tasa de Interés,Tasa Máxima de Interés\nBank5,2.5,3.0';
    component.parseCSV(csvData);

    expect(component.batchBankRates.length).toBe(1);
    expect(component.batchBankRates[0].bankName).toBe('Bank5');
  });

  it('should handle incorrect CSV format', () => {
    const incorrectCSVData = 'Incorrect,Data,Format';
    spyOn(component.showModal, 'emit');

    component.parseCSV(incorrectCSVData);

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'El archivo CSV tiene un formato incorrecto.',
      type: 'error'
    });
  });
});
