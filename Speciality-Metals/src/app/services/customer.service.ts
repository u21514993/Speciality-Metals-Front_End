import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { customer } from '../shared/customer';

@Injectable({
  providedIn: 'root'
})
export class CustService {
  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Customer';
  
  constructor(private http: HttpClient) {}

  // Get all customers
  getAllCustomers(): Observable<customer[]> {
    return this.http.get<customer[]>(this.apiUrl);
  }

  // Get a customer by ID
  getCustomerById(id: number): Observable<customer> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<customer>(url);
  }

  // Add a new customer
  addCustomer(customer: customer): Observable<customer> {
    return this.http.post<customer>(this.apiUrl, customer, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // Update an existing customer
  updateCustomer(id: number, customer: customer): Observable<customer> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<customer>(url, customer, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // Delete a customer
  deleteCustomer(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
  }