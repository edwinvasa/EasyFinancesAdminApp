import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-expense-types',
  templateUrl: './expense-types.component.html'
})
export class ExpenseTypesComponent implements OnInit {

  @Input() isLoading: boolean = false;
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() showModal = new EventEmitter<{ title: string, message: string, type: string, action?: Function }>();

  newExpenseName: string = '';
  newExpenseCategory: string = '';
  expenseTypes: any[] = [];
  filteredExpenseTypes: any[] = [];
  searchExpenseName: string = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.getExpenseTypes();
  }

  // Obtener tipos de gastos
  getExpenseTypes() {
    this.loadingChange.emit(true);
    this.adminService.getExpenseTypes().subscribe({
      next: (data) => {
        this.expenseTypes = data.map((expense: any) => ({
          ...expense,
          editing: false,
          selected: false
        }));
        this.filteredExpenseTypes = data;
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al obtener los tipos de gastos:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo obtener los tipos de gastos.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Crear nuevo tipo de gasto
  onCreateExpenseType() {
    this.loadingChange.emit(true);
    this.adminService.createExpenseType(this.newExpenseName, this.newExpenseCategory).subscribe({
      next: () => {
        this.newExpenseName = '';
        this.newExpenseCategory = '';
        this.getExpenseTypes();
        this.showModal.emit({ title: 'Éxito', message: 'El tipo de gasto se creó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al crear el tipo de gasto:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo crear el tipo de gasto.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Actualizar tipo de gasto
  onUpdateExpenseType(expense: any) {
    this.loadingChange.emit(true);
    this.adminService.updateExpenseType(expense.id, expense.name, expense.category).subscribe({
      next: () => {
        expense.editing = false;
        this.getExpenseTypes();
        this.showModal.emit({ title: 'Éxito', message: 'El tipo de gasto se actualizó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al actualizar el tipo de gasto:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo actualizar el tipo de gasto.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Eliminar tipo de gasto
  onDeleteExpenseType(id: number) {
    // Mostrar el modal de confirmación con la acción de eliminación
    this.showModal.emit({
      title: 'Confirmación',
      message: '¿Está seguro de que desea eliminar este tipo de gasto?',
      type: 'confirm',
      action: () => {
        this.executeDeleteExpenseType(id);
      }
    });
  }

  private executeDeleteExpenseType(id: number) {
    this.loadingChange.emit(true);
  
    this.adminService.deleteExpenseType(id)
      .pipe(
        catchError(err => {
          console.error('Error al eliminar el tipo de gasto:', err);
          this.showModal.emit({ title: 'Error', message: 'No se pudo eliminar el tipo de gasto.', type: 'error' });
          this.loadingChange.emit(false);
          return of(null);  // Completa el flujo devolviendo un observable nulo
        })
      )
      .subscribe({
        next: () => {
          this.getExpenseTypes();
          this.showModal.emit({ title: 'Éxito', message: 'El tipo de gasto se eliminó correctamente.', type: 'success' });
          this.loadingChange.emit(false);
        },
        error: (err) => {
          console.error('Error inesperado:', err);  // Manejo de errores no anticipados
          this.loadingChange.emit(false);
        }
      });
  }

  // Habilitar la edición del tipo de gasto
  enableEditExpenseType(expense: any) {
    expense.editing = true;
  }

  // Cancelar la edición del tipo de gasto
  cancelEditExpenseType(expense: any) {
    expense.editing = false;
    this.getExpenseTypes();
  }

  // Filtrar tipos de gastos por nombre y categoría
  filterExpenseTypes() {
    this.filteredExpenseTypes = this.expenseTypes.filter(expense =>
      expense.name.toLowerCase().includes(this.searchExpenseName.toLowerCase()) ||
      expense.category.toLowerCase().includes(this.searchExpenseName.toLowerCase())
    );
  }

  // Refrescar tipos de gastos
  refreshExpenseTypes() {
    this.getExpenseTypes();
  }

  // Seleccionar todos los elementos
  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.filteredExpenseTypes.forEach(expense => expense.selected = isChecked);
  }

  // Verificar si hay tipos de gastos seleccionados
  hasSelectedExpenses(): boolean {
    return this.filteredExpenseTypes.some(expense => expense.selected);
  }

  // Eliminar tipos de gastos seleccionados
  deleteSelectedExpenses() {
    const selectedExpenses = this.filteredExpenseTypes.filter(expense => expense.selected);
    if (selectedExpenses.length > 0) {
      const actionToExecute = () => {
        const idsToDelete = selectedExpenses.map(expense => expense.id);
        this.executeDeleteBatch(idsToDelete);
      };

      // Mostrar modal de confirmación
      this.showModal.emit({
        title: 'Confirmación',
        message: '¿Está seguro de que desea eliminar los tipos de gastos seleccionados?',
        type: 'confirm',
        action: actionToExecute
      });
    }
  }

  // Ejecutar eliminación en lote, una por una
  private executeDeleteBatch(ids: number[]) {
    this.loadingChange.emit(true);
    let completed = 0;
    let hasErrors = false;

    ids.forEach(id => {
      this.adminService.deleteExpenseType(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.finalizeBatchDeletion(hasErrors);
          }
        },
        error: (err) => {
          console.error(`Error al eliminar el tipo de gasto con ID: ${id}`, err);
          hasErrors = true;
          completed++;
          if (completed === ids.length) {
            this.finalizeBatchDeletion(hasErrors);
          }
        }
      });
    });
  }

  // Finalizar eliminación en lote
  private finalizeBatchDeletion(hasErrors: boolean) {
    this.getExpenseTypes();
    this.loadingChange.emit(false);
    if (hasErrors) {
      this.showModal.emit({ title: 'Error', message: 'No se pudieron eliminar algunos tipos de gastos.', type: 'error' });
    } else {
      this.showModal.emit({ title: 'Éxito', message: 'Los tipos de gastos seleccionados se eliminaron correctamente.', type: 'success' });
    }
  }
}