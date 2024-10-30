import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExpenseTypesComponent } from './expense-types.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ExpenseTypesComponent', () => {
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
    const deleteSpy = spyOn(adminService, 'deleteExpenseType').and.returnValue(of(null));
    let emittedValue: any;
  
    spyOn(component.showModal, 'emit').and.callFake((value) => emittedValue = value);
    spyOn(component, 'getExpenseTypes');
  
    component.onDeleteExpenseType(1);
  
    const modalAction = emittedValue.action;
    modalAction();
  
    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(component.getExpenseTypes).toHaveBeenCalled();
  });  
  
  it('should handle error in onDeleteExpenseType', () => {
    spyOn(adminService, 'deleteExpenseType').and.returnValue(throwError(() => new Error('Error')));
    let emittedValue: any;
  
    spyOn(component.showModal, 'emit').and.callFake((value) => {
      emittedValue = value;
    });
  
    component.onDeleteExpenseType(1);
  
    expect(emittedValue).toBeDefined();
    const modalAction = emittedValue.action;
  
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

  // Prueba para cancelar la edición de un tipo de gasto
  it('should cancel editing an expense type', () => {
    const expense = { id: 1, name: 'Comida', category: 'Variable', editing: true };
    component.expenseTypes = [expense];

    component.cancelEditExpenseType(expense);

    expect(expense.editing).toBeFalse();
  });

  it('should delete selected expenses', () => {
    component.filteredExpenseTypes = [
      { id: 1, name: 'Comida', category: 'Variable', selected: true },
      { id: 2, name: 'Alquiler', category: 'Fijo', selected: false }
    ];
  
    spyOn(adminService, 'deleteExpenseType').and.returnValue(of(null));
    spyOn(component.showModal, 'emit').and.callFake((modalData) => {
      if (modalData && modalData.type === 'confirm' && modalData.action) {
        modalData.action(); // Simula la confirmación
      }
    });
  
    component.deleteSelectedExpenses();
  
    expect(adminService.deleteExpenseType).toHaveBeenCalledWith(1);
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Éxito',
      message: 'Los tipos de gastos seleccionados se eliminaron correctamente.',
      type: 'success'
    });
  });

  it('should handle batch deletion through deleteSelectedExpenses', () => {
    component.filteredExpenseTypes = [
      { id: 1, name: 'Comida', category: 'Variable', selected: true },
      { id: 2, name: 'Alquiler', category: 'Fijo', selected: true }
    ];
  
    spyOn(adminService, 'deleteExpenseType').and.returnValue(of(null));
    spyOn(component.showModal, 'emit').and.callFake((modalData) => {
      if (modalData && modalData.type === 'confirm' && modalData.action) {
        modalData.action(); // Simula la confirmación
      }
    });
  
    component.deleteSelectedExpenses();
  
    expect(adminService.deleteExpenseType).toHaveBeenCalledTimes(2);
    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Éxito',
      message: 'Los tipos de gastos seleccionados se eliminaron correctamente.',
      type: 'success'
    });
  });

  // Prueba para verificar si hay tipos de gastos seleccionados
  it('should return true if there are selected expenses', () => {
    component.filteredExpenseTypes = [
      { id: 1, selected: true },
      { id: 2, selected: false }
    ];

    expect(component.hasSelectedExpenses()).toBeTrue();
  });

  it('should return false if there are no selected expenses', () => {
    component.filteredExpenseTypes = [
      { id: 1, selected: false },
      { id: 2, selected: false }
    ];

    expect(component.hasSelectedExpenses()).toBeFalse();
  });

});
