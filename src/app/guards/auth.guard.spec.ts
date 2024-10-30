import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Crear un espía para el Router
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy }
      ]
    });

    authGuard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    // Limpiar localStorage después de cada test
    localStorage.removeItem('authToken');
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should return true if authToken exists in localStorage', () => {
    // Simular la existencia del token en localStorage
    localStorage.setItem('authToken', 'test-token');

    const result = authGuard.canActivate();

    expect(result).toBeTrue();
  });

  it('should return false and navigate to /login if authToken is missing', () => {
    // Asegurarse de que no haya token en localStorage
    localStorage.removeItem('authToken');

    const result = authGuard.canActivate();

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
