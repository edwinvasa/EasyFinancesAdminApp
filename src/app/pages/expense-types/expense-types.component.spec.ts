import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTypesComponent } from './expense-types.component';

describe('ExpenseTypesComponent', () => {
  let component: ExpenseTypesComponent;
  let fixture: ComponentFixture<ExpenseTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenseTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
