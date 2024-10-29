import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExpenseTypesComponent } from './expense-types.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

fdescribe('ExpenseTypesComponent', () => {
  let component: ExpenseTypesComponent;
  let fixture: ComponentFixture<ExpenseTypesComponent>;
  let adminService: AdminService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseTypesComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [AdminService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseTypesComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getExpenseTypes on init', () => {
    spyOn(component, 'getExpenseTypes');
    component.ngOnInit();
    expect(component.getExpenseTypes).toHaveBeenCalled();
  });

  it('should set expenseTypes after calling getExpenseTypes', () => {
    const mockExpenses = [{ id: 1, name: 'Alquiler', category: 'Fijo' }];
    spyOn(adminService, 'getExpenseTypes').and.returnValue(of(mockExpenses));

    component.getExpenseTypes();
    expect(component.expenseTypes).toEqual([{ ...mockExpenses[0], editing: false, selected: false }]);
  });

  it('should handle error in getExpenseTypes', () => {
    spyOn(adminService, 'getExpenseTypes').and.returnValue(throwError(() => new Error('Error')));
    spyOn(component.showModal, 'emit');

    component.getExpenseTypes();
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo obtener los tipos de gastos.',
      type: 'error'
    });
  });

  it('should create a new expense type', () => {
    spyOn(adminService, 'createExpenseType').and.returnValue(of(null));
    spyOn(component, 'getExpenseTypes');

    component.newExpenseName = 'Transporte';
    component.newExpenseCategory = 'Variable';
    component.onCreateExpenseType();

    expect(adminService.createExpenseType).toHaveBeenCalledWith('Transporte', 'Variable');
    expect(component.newExpenseName).toBe('');
    expect(component.newExpenseCategory).toBe('');
    expect(component.getExpenseTypes).toHaveBeenCalled();
  });

  it('should handle error in onCreateExpenseType', () => {
    spyOn(adminService, 'createExpenseType').and.returnValue(throwError(() => new Error('Error')));
    spyOn(component.showModal, 'emit');
  
    // Simula la creación del tipo de gasto con datos incorrectos
    component.newExpenseName = 'Transporte';
    component.newExpenseCategory = 'Variable';
    
    component.onCreateExpenseType();
  
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo crear el tipo de gasto.',
      type: 'error'
    });
  });
  

  it('should update an expense type', () => {
    spyOn(adminService, 'updateExpenseType').and.returnValue(of(null));
    spyOn(component, 'getExpenseTypes');

    const expense = { id: 1, name: 'Comida', category: 'Variable', editing: true };
    component.onUpdateExpenseType(expense);

    expect(adminService.updateExpenseType).toHaveBeenCalledWith(1, 'Comida', 'Variable');
    expect(expense.editing).toBeFalse();
    expect(component.getExpenseTypes).toHaveBeenCalled();
  });

  it('should handle error in onUpdateExpenseType', () => {
    spyOn(adminService, 'updateExpenseType').and.returnValue(throwError(() => new Error('Error')));
    spyOn(component.showModal, 'emit');

    const expense = { id: 1, name: 'Comida', category: 'Variable', editing: true };
    component.onUpdateExpenseType(expense);

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo actualizar el tipo de gasto.',
      type: 'error'
    });
  });

  it('should delete an expense type', () => {
    // Espiar el método deleteExpenseType del servicio
    const deleteSpy = spyOn(adminService, 'deleteExpenseType').and.returnValue(of(null));
    let emittedValue: any;
  
    // Espiar la emisión del modal
    spyOn(component.showModal, 'emit').and.callFake((value) => emittedValue = value);
  
    // Espiar getExpenseTypes para que no sea la llamada real
    spyOn(component, 'getExpenseTypes');
  
    // Llama al método público para iniciar la eliminación
    component.onDeleteExpenseType(1);
  
    // Obtiene la acción emitida por el modal
    const modalAction = emittedValue.action;
  
    // Ejecuta la acción del modal para simular la confirmación
    modalAction();
  
    // Verifica que se haya llamado al espía de deleteExpenseType
    expect(deleteSpy).toHaveBeenCalledWith(1);
  
    // Verifica que se haya llamado a getExpenseTypes
    expect(component.getExpenseTypes).toHaveBeenCalled();
  });  
  
  it('should handle error in onDeleteExpenseType', () => {
    spyOn(adminService, 'deleteExpenseType').and.returnValue(throwError(() => new Error('Error')));
    let emittedValue: any;
  
    spyOn(component.showModal, 'emit').and.callFake((value) => {
      emittedValue = value;
    });
  
    // Llamar al método público para iniciar la eliminación
    component.onDeleteExpenseType(1);
  
    // Obtener la acción del modal desde el valor emitido
    expect(emittedValue).toBeDefined();
    const modalAction = emittedValue.action;
  
    // Ejecutar la acción del modal para simular la confirmación
    modalAction();
  
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo eliminar el tipo de gasto.',
      type: 'error'
    });
  });  

  it('should filter expense types', () => {
    component.expenseTypes = [
      { id: 1, name: 'Comida', category: 'Variable' },
      { id: 2, name: 'Alquiler', category: 'Fijo' }
    ];

    component.searchExpenseName = 'comida';
    component.filterExpenseTypes();
    expect(component.filteredExpenseTypes.length).toBe(1);
    expect(component.filteredExpenseTypes[0].name).toBe('Comida');
  });

  it('should toggle select all expenses', () => {
    component.filteredExpenseTypes = [
      { id: 1, name: 'Comida', category: 'Variable', selected: false },
      { id: 2, name: 'Alquiler', category: 'Fijo', selected: false }
    ];

    const event = { target: { checked: true } };
    component.toggleSelectAll(event);

    expect(component.filteredExpenseTypes.every(expense => expense.selected)).toBeTrue();
  });
});
