import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.username === 'admin' && this.password === 'password') {
      // Simulación de autenticación
      localStorage.setItem('authToken', 'basicAuthToken'); // Aquí podrías manejar un token
      this.router.navigate(['/dashboard']); // Redirigir al dashboard
    } else {
      alert('Invalid credentials');
    }
  }
}