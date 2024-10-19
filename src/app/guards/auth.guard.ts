import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      return true; // Si está autenticado, permite el acceso
    } else {
      this.router.navigate(['/login']); // Si no, redirige al login
      return false;
    }
  }
}
