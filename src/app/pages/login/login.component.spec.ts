import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard on successful login', () => {
    spyOn(router, 'navigate');
    spyOn(localStorage, 'setItem');

    component.username = 'admin';
    component.password = 'password';
    component.onSubmit();

    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'basicAuthToken');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show alert on invalid credentials', () => {
    spyOn(window, 'alert');

    component.username = 'wrongUser';
    component.password = 'wrongPass';
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
  });
});
