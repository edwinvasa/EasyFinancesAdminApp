import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankRatesComponent } from './bank-rates.component';

describe('BankRatesComponent', () => {
  let component: BankRatesComponent;
  let fixture: ComponentFixture<BankRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankRatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
