import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSubscribersComponent } from './notification-subscribers.component';

describe('NotificationSubscribersComponent', () => {
  let component: NotificationSubscribersComponent;
  let fixture: ComponentFixture<NotificationSubscribersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSubscribersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationSubscribersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
