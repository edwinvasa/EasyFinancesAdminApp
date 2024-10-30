import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(private readonly router: Router) {}

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
