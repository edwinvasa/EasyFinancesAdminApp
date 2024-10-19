import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { BankRatesComponent } from './pages/bank-rates/bank-rates.component';
import { ExpenseTypesComponent } from './pages/expense-types/expense-types.component';
import { RateTypesComponent } from './pages/rate-types/rate-types.component';
import { NotificationSubscribersComponent } from './pages/notification-subscribers/notification-subscribers.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    BankRatesComponent,
    ExpenseTypesComponent,
    RateTypesComponent,
    NotificationSubscribersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
