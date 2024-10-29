import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RateTypesComponent } from './rate-types.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('RateTypesComponent', () => {
  let component: RateTypesComponent;
  let fixture: ComponentFixture<RateTypesComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let emitSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    // Crear un objeto simulado para el servicio AdminService
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getRateTypes', 'createRateType', 'updateRateType', 'deleteRateType']);

    TestBed.configureTestingModule({
      declarations: [RateTypesComponent],
      imports: [FormsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ignorar elementos desconocidos en el test
    }).compileComponents();

    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateTypesComponent);
    component = fixture.componentInstance;

    // Configurar el método simulado para que devuelva un observable
    adminService.getRateTypes.and.returnValue(of([
      { id: 1, name: 'Tasa Fija' },
      { id: 2, name: 'Tasa Variable' }
    ]));

    emitSpy = spyOn(component.showModal, 'emit');

    fixture.detectChanges(); // Ejecutar ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getRateTypes on init', () => {
    expect(adminService.getRateTypes).toHaveBeenCalled();
    expect(component.rateTypes.length).toBe(2);
  });

  it('should handle error in getRateTypes', () => {
    adminService.getRateTypes.and.returnValue(throwError(() => new Error('Error')));

    component.getRateTypes();

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo obtener los tipos de tasas.',
      type: 'error'
    });
  });

  it('should create a new rate type', () => {
    spyOn(component, 'getRateTypes');
    adminService.createRateType.and.returnValue(of(null));

    component.newRateTypeName = 'Nueva Tasa';
    component.onCreateRateType();

    expect(adminService.createRateType).toHaveBeenCalledWith('Nueva Tasa');
    expect(component.getRateTypes).toHaveBeenCalled();
    expect(component.newRateTypeName).toBe('');
  });

  it('should handle error in onCreateRateType', () => {
    adminService.createRateType.and.returnValue(throwError(() => new Error('Error')));

    component.newRateTypeName = 'Nueva Tasa';
    component.onCreateRateType();

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo crear el tipo de tasa.',
      type: 'error'
    });
  });

  it('should update a rate type', () => {
    spyOn(component, 'getRateTypes');
    adminService.updateRateType.and.returnValue(of(null));

    const rateType = { id: 1, name: 'Tasa Actualizada', editing: true };
    component.onUpdateRateType(rateType);

    expect(adminService.updateRateType).toHaveBeenCalledWith(1, 'Tasa Actualizada');
    expect(component.getRateTypes).toHaveBeenCalled();
    expect(rateType.editing).toBeFalse();
  });

  it('should handle error in onUpdateRateType', () => {
    adminService.updateRateType.and.returnValue(throwError(() => new Error('Error')));

    const rateType = { id: 1, name: 'Tasa Actualizada', editing: true };
    component.onUpdateRateType(rateType);

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo actualizar el tipo de tasa.',
      type: 'error'
    });
  });

  it('should emit showModal for delete confirmation', () => {
    component.onDeleteRateType(1);

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Confirmación',
      message: '¿Está seguro de que desea eliminar este tipo de tasa?',
      type: 'confirm',
      action: jasmine.any(Function)
    });
  });

  it('should execute deleteRateType and refresh list on success', () => {
    spyOn(component, 'getRateTypes');
    adminService.deleteRateType.and.returnValue(of(null));

    // Simular el evento de eliminación
    emitSpy.and.callFake((modalData: any) => {
      if (modalData && modalData.action) {
        modalData.action();
      }
    });

    component.onDeleteRateType(1);

    expect(emitSpy).toHaveBeenCalled();
    expect(adminService.deleteRateType).toHaveBeenCalledWith(1);
    expect(component.getRateTypes).toHaveBeenCalled();
  });

  it('should handle error in deleteRateType', () => {
    adminService.deleteRateType.and.returnValue(throwError(() => new Error('Error')));

    // Simular el evento de eliminación
    emitSpy.and.callFake((modalData: any) => {
      if (modalData && modalData.action) {
        modalData.action();
      }
    });

    component.onDeleteRateType(1);

    expect(emitSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo eliminar el tipo de tasa.',
      type: 'error'
    });
  });

  it('should refresh rate types list', () => {
    spyOn(component, 'getRateTypes');
    component.refreshRateTypes();
    expect(component.getRateTypes).toHaveBeenCalled();
  });
});
