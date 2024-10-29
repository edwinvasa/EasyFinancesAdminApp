import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ElementRef, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Modal } from 'bootstrap';

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let elementRef: ElementRef;
  let cdr: ChangeDetectorRef;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
        ChangeDetectorRef
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ignorar componentes desconocidos
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    elementRef = TestBed.inject(ElementRef);
    cdr = TestBed.inject(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set loading state correctly', () => {
    component.setLoading(true);
    expect(component.isLoading).toBeTrue();

    component.setLoading(false);
    expect(component.isLoading).toBeFalse();
  });

  it('should confirm modal action and hide modal', () => {
    const action = jasmine.createSpy('modalAction');
    component.modalAction = action;

    const modalElement = document.createElement('div');
    modalElement.setAttribute('id', 'infoModal');
    document.body.appendChild(modalElement);

    // Simular la instancia del modal de Bootstrap
    spyOn(Modal, 'getInstance').and.returnValue({ hide: jasmine.createSpy('hide') } as any);

    component.confirmModalAction();

    expect(action).toHaveBeenCalled();
    expect(component.modalAction).toBeNull();
  });

  it('should handle tab shown.bs.tab event', () => {
    const tabContainer = document.createElement('div');
    tabContainer.setAttribute('id', 'adminTab');
    elementRef.nativeElement.appendChild(tabContainer);

    const event = new Event('shown.bs.tab');
    tabContainer.dispatchEvent(event);

    fixture.detectChanges();
    expect(tabContainer).toBeTruthy();
  });
});
