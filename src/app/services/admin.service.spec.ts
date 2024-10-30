import { TestBed } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://easy-finances-admin-403ac1f06410.herokuapp.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call updateBankRates and return response', () => {
    service.updateBankRates().subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/scraping/update-bank-rates`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toContain('Basic');
    req.flush({}); // Simular respuesta vacía
  });

  it('should call createExpenseType and return response', () => {
    const expenseType = { name: 'New Expense', category: 'Category' };

    service.createExpenseType(expenseType.name, expenseType.category).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/expense-types`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expenseType);
    req.flush({}); // Simular respuesta vacía
  });

  it('should call getExpenseTypes and return data', () => {
    const mockExpenseTypes = [{ id: 1, name: 'Expense1' }, { id: 2, name: 'Expense2' }];

    service.getExpenseTypes().subscribe(data => {
      expect(data).toEqual(mockExpenseTypes);
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/expense-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExpenseTypes); // Simular respuesta con datos
  });

  it('should call updateExpenseType and return response', () => {
    const updatedExpenseType = { name: 'Updated Expense', category: 'Updated Category' };

    service.updateExpenseType(1, updatedExpenseType.name, updatedExpenseType.category).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/expense-types/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedExpenseType);
    req.flush({}); // Simular respuesta vacía
  });

  it('should call deleteExpenseType and return response', () => {
    service.deleteExpenseType(1).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/expense-types/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}); // Simular respuesta vacía
  });

  it('should call getRateTypes and return data', () => {
    const mockRateTypes = [{ id: 1, name: 'Rate1' }, { id: 2, name: 'Rate2' }];

    service.getRateTypes().subscribe(data => {
      expect(data).toEqual(mockRateTypes);
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/rate-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRateTypes); // Simular respuesta con datos
  });

  it('should call createRateType and return response', () => {
    const rateTypeName = 'New Rate';

    service.createRateType(rateTypeName).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/rate-types`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: rateTypeName });
    req.flush({}); // Simular respuesta vacía
  });

  it('should call deleteRateType and return response', () => {
    service.deleteRateType(1).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/rate-types/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}); // Simular respuesta vacía
  });

  it('should call getNotificationSubscribers and return data', () => {
    const mockSubscribers = [{ email: 'test1@example.com' }, { email: 'test2@example.com' }];

    service.getNotificationSubscribers().subscribe(data => {
      expect(data).toEqual(mockSubscribers);
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/notification-subscriptions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubscribers); // Simular respuesta con datos
  });

  it('should call deleteNotificationSubscriber and return response', () => {
    service.deleteNotificationSubscriber('test@example.com').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/admin/notification-subscriptions/unsubscribe`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({}); // Simular respuesta vacía
  });
});
