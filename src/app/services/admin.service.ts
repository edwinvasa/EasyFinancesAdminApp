import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly baseUrl = 'https://easy-finances-admin-403ac1f06410.herokuapp.com';

  constructor(private readonly http: HttpClient) { }

  updateBankRates(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.get(`${this.baseUrl}/admin/scraping/update-bank-rates`, { headers });
  }

  // Método para crear un nuevo tipo de gasto
  createExpenseType(name: string, category: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('admin:password')
    });

    const body = {
      name: name,
      category: category
    };

    return this.http.post(`${this.baseUrl}/admin/expense-types`, body, { headers });
  }

  getExpenseTypes(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.get(`${this.baseUrl}/admin/expense-types`, { headers });
  }
  
  updateExpenseType(id: number, name: string, category: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password'),
      'Content-Type': 'application/json'
    });
  
    const body = { name, category };
  
    return this.http.put(`${this.baseUrl}/admin/expense-types/${id}`, body, { headers });
  }

  deleteExpenseType(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.delete(`${this.baseUrl}/admin/expense-types/${id}`, { headers });
  }
  
  getBankInterestRates(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.get(`${this.baseUrl}/admin/bank-interest-rates`, { headers });
  }
  
  deleteBankInterestRate(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.delete(`${this.baseUrl}/admin/bank-interest-rates/${id}`, { headers });
  }
  
  getRateTypes(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.get(`${this.baseUrl}/admin/rate-types`, { headers });
  }

  updateRateType(id: number, name: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password'),
      'Content-Type': 'application/json'
    });
  
    const body = { name };
  
    return this.http.put(`${this.baseUrl}/admin/rate-types/${id}`, body, { headers });
  }

  deleteRateType(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.delete(`${this.baseUrl}/admin/rate-types/${id}`, { headers });
  }

  getNotificationSubscribers(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
  
    return this.http.get(`${this.baseUrl}/admin/notification-subscriptions`, { headers });
  }

  deleteNotificationSubscriber(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password'),
      'Content-Type': 'application/json'
    });
  
    const body = { email };
  
    return this.http.delete(`${this.baseUrl}/admin/notification-subscriptions/unsubscribe`, { headers, body });
  }

  createOrUpdateBankInterestRate(bankName: string, interesRate: number, maxInteresRate: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password'),
      'Content-Type': 'application/json'
    });
  
    const body = {
      bankName,
      interesRate,
      maxInteresRate
    };
  
    return this.http.post(`${this.baseUrl}/admin/bank-interest-rates`, body, { headers });
  }
  
  createOrUpdateBankInterestRatesBatch(batchRates: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('admin:password')
    });

    return this.http.post(`${this.baseUrl}/admin/bank-interest-rates/batch`, batchRates, {
      headers,
      responseType: 'text'
    });
  }
  
  createRateType(rateTypeName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password'),
      'Content-Type': 'application/json'
    });
  
    const body = { name: rateTypeName };
  
    return this.http.post(`${this.baseUrl}/admin/rate-types`, body, { headers });
  }
  
}
