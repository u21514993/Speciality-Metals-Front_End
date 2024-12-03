import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { sundry } from '../shared/sundry';
import { catchError } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

  export class sundryservice  {
    private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Sundry';
    private productApiUrl = 'https://localhost:7218/api/SpecialityMetals_Product'; 
    private sundrynotesApiUrl ='https://localhost:7218/api/SpecialityMetals_Sundry_Note';
    private httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };
    constructor(private http: HttpClient) { }
    private handleError(error: HttpErrorResponse) {
        console.error('Error occurred:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

      getSundryNotes():Observable<any> {
        return this.http.get(this.sundrynotesApiUrl, this.httpOptions).pipe
        (catchError(this.handleError))
      }
    
      getAllSundry(): Observable<any> {
        return this.http.get<any>(this.apiUrl).pipe(
          catchError(this.handleError)
        );
      }
    
      getSundryById(id: number): Observable<sundry> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<sundry>(url).pipe(
          catchError(this.handleError)
        );
      }
    
      addSundry(Sundry: sundry): Observable<sundry> {
        console.log('Sending sundry:', Sundry); // Log the data being sent
        return this.http.post<sundry>(this.apiUrl, Sundry, this.httpOptions).pipe(
            catchError(error => {
                console.error('Error details:', error);
                return throwError(() => error);
            })
        );
    }
    
    updateSundry(id: number, Sundry: sundry): Observable<sundry> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<sundry>(url, Sundry, this.httpOptions).pipe(
            catchError(this.handleError)
        );
    }
    
      deleteSundry(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
          catchError(this.handleError)
        );
      }
      getAllProducts(): Observable<any> {
        return this.http.get<any>(this.productApiUrl).pipe(
          catchError(this.handleError)
        );
      }
  }