import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { outgoing } from '../shared/outgoing';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class OutService {
  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Outgoing';
  private customerApiUrl = 'https://localhost:7218/api/SpecialityMetals_Customer'; // Adjust to your actual customers API URL
  private productApiUrl = 'https://localhost:7218/api/SpecialityMetals_Product'; // Adjust to your actual products API URL
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  getAllOutgoing(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getOutgoingById(id: number): Observable<outgoing> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<outgoing>(url).pipe(
      catchError(this.handleError)
    );
  }

  addOutgoing(outgoing: outgoing): Observable<outgoing> {
    return this.http.post<outgoing>(this.apiUrl, outgoing, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateOutgoing(id: number, outgoing: outgoing): Observable<outgoing> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<outgoing>(url, outgoing, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteOutgoing(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // New method to get all customers
  getAllCustomers(): Observable<any> {
    return this.http.get<any>(this.customerApiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // New method to get all products
  getAllProducts(): Observable<any> {
    return this.http.get<any>(this.productApiUrl).pipe(
      catchError(this.handleError)
    );
  }
}