import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-notification-subscribers',
  templateUrl: './notification-subscribers.component.html',
  styleUrls: ['./notification-subscribers.component.css']
})
export class NotificationSubscribersComponent implements OnInit {

  @Input() isLoading: boolean = false;
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() showModal = new EventEmitter<{ title: string, message: string, type: string, action?: Function }>();

  notificationSubscribers: any[] = [];
  searchSubscriberEmail: string = '';
  filteredNotificationSubscribers: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.getNotificationSubscribers();
  }

  // Obtener suscriptores de notificación
  getNotificationSubscribers() {
    this.loadingChange.emit(true);
    this.adminService.getNotificationSubscribers().subscribe({
      next: (data) => {
        this.notificationSubscribers = data;
        this.filteredNotificationSubscribers = data;
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al obtener los suscriptores:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo obtener los suscriptores de notificación.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Filtrar los suscriptores por correo
  filterSubscribers() {
    this.filteredNotificationSubscribers = this.notificationSubscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(this.searchSubscriberEmail.toLowerCase())
    );
  }

  // Eliminar suscriptor de notificación
  onDeleteSubscriber(email: string) {
    // Mostrar el modal de confirmación con la acción de eliminación
    this.showModal.emit({
      title: 'Confirmación',
      message: `¿Está seguro de que desea eliminar el suscriptor con el correo: ${email}?`,
      type: 'confirm',
      action: () => {
        this.executeDeleteSubscriber(email);
      }
    });
  }

  // Ejecutar la eliminación de suscriptor
  private executeDeleteSubscriber(email: string) {
    this.loadingChange.emit(true);
    this.adminService.deleteNotificationSubscriber(email).subscribe({
      next: () => {
        this.getNotificationSubscribers();
        this.showModal.emit({ title: 'Éxito', message: 'El suscriptor se eliminó correctamente.', type: 'success' });
        this.loadingChange.emit(false);
      },
      error: (err) => {
        console.error('Error al eliminar el suscriptor:', err);
        this.showModal.emit({ title: 'Error', message: 'No se pudo eliminar el suscriptor.', type: 'error' });
        this.loadingChange.emit(false);
      }
    });
  }

  // Refrescar suscriptores
  refreshNotificationSubscribers() {
    this.getNotificationSubscribers();
  }
}
