import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BankRatesComponent } from './bank-rates.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

fdescribe('BankRatesComponent', () => {
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
});
