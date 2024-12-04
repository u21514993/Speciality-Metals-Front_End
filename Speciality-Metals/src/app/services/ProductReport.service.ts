import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportProduct {
    product_Name: string;
    deliveryNote: string;
    outgoingDate: string;
  }

@Injectable({
  providedIn: 'root'
})
export class ProductReportService {
    private apiUrl = 'https://localhost:7218/api/ProductReport_/deliverynotes'; // Correct API URL

    constructor(private http: HttpClient) {}
  
    // Fetch delivery notes by product name
    getDeliveryNotesByProductName(productName: string): Observable<ReportProduct[]> {
      const url = `${this.apiUrl}/${encodeURIComponent(productName)}`; // Adjusted to send productName in the URL path
      return this.http.get<ReportProduct[]>(url); // Fetch the data from the server
    }
  }