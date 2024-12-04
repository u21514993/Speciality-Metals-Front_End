import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportCust } from '../shared/ReportCust';

@Injectable({
  providedIn: 'root'
})
export class ReportCustService {
    private apiUrl = 'https://localhost:7218/api/ReportCust_/deliverynotes';
    private customerApiUrl = 'https://localhost:7218/api/SpecialityMetals_Customer';  // API to fetch customers
  
    constructor(private http: HttpClient) { }
  
    // Fetch customer names for the dropdown
    getCustomers(): Observable<string[]> {
        return this.http.get<string[]>('https://localhost:7218/api/SpecialityMetals_Customer');  // Ensure this returns only names
      }
      
  
    // Fetch delivery notes based on customer name
    getDeliveryNotesByCustomerName(customerName: string): Observable<any> {
        const url = `${this.apiUrl}/${encodeURIComponent(customerName)}`; // Encode input for safety
        return this.http.get<any>(url); // Fetch delivery notes
      }
      
      
  }