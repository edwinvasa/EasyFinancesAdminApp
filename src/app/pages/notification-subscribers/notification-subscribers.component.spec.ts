import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NotificationSubscribersComponent } from './notification-subscribers.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('NotificationSubscribersComponent', () => {
  let component: NotificationSubscribersComponent;
  let fixture: ComponentFixture<NotificationSubscribersComponent>;
  let adminService: jasmine.SpyObj<AdminService>;

  beforeEach(waitForAsync(() => {
    // Crear un objeto simulado para el servicio AdminService
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getNotificationSubscribers', 'deleteNotificationSubscriber']);

    TestBed.configureTestingModule({
      declarations: [NotificationSubscribersComponent],
      imports: [FormsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSubscribersComponent);
    component = fixture.componentInstance;

    // Configurar el método simulado para que devuelva un observable
    adminService.getNotificationSubscribers.and.returnValue(of([
      { email: 'test@example.com', subscribedAt: new Date() }
    ]));

    fixture.detectChanges(); // Ejecutar ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getNotificationSubscribers on init', () => {
    expect(adminService.getNotificationSubscribers).toHaveBeenCalled();
    expect(component.notificationSubscribers.length).toBe(1);
  });

  it('should handle error in getNotificationSubscribers', () => {
    spyOn(component.showModal, 'emit');
    adminService.getNotificationSubscribers.and.returnValue(throwError(() => new Error('Error')));

    component.getNotificationSubscribers();

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo obtener los suscriptores de notificación.',
      type: 'error'
    });
  });

  it('should filter subscribers by email', () => {
    component.notificationSubscribers = [
      { email: 'test1@example.com', subscribedAt: new Date() },
      { email: 'test2@example.com', subscribedAt: new Date() }
    ];

    component.searchSubscriberEmail = 'test1';
    component.filterSubscribers();

    expect(component.filteredNotificationSubscribers.length).toBe(1);
    expect(component.filteredNotificationSubscribers[0].email).toBe('test1@example.com');
  });

  it('should emit showModal for delete confirmation', () => {
    spyOn(component.showModal, 'emit');

    component.onDeleteSubscriber('test@example.com');

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Confirmación',
      message: '¿Está seguro de que desea eliminar el suscriptor con el correo: test@example.com?',
      type: 'confirm',
      action: jasmine.any(Function)
    });
  });

  it('should execute deleteSubscriber and refresh list on success', () => {
    spyOn(component, 'getNotificationSubscribers');
    adminService.deleteNotificationSubscriber.and.returnValue(of(null));

    // Simular la acción del modal
    component['executeDeleteSubscriber']('test@example.com');

    expect(adminService.deleteNotificationSubscriber).toHaveBeenCalledWith('test@example.com');
    expect(component.getNotificationSubscribers).toHaveBeenCalled();
  });

  it('should handle error in deleteNotificationSubscriber', () => {
    spyOn(component.showModal, 'emit');
    adminService.deleteNotificationSubscriber.and.returnValue(throwError(() => new Error('Error')));

    // Simular la acción del modal
    component['executeDeleteSubscriber']('test@example.com');

    expect(component.showModal.emit).toHaveBeenCalledWith({
      title: 'Error',
      message: 'No se pudo eliminar el suscriptor.',
      type: 'error'
    });
  });

  it('should refresh subscribers list', () => {
    spyOn(component, 'getNotificationSubscribers');
    component.refreshNotificationSubscribers();
    expect(component.getNotificationSubscribers).toHaveBeenCalled();
  });
});
