import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';
import { GRV } from '../shared/grv';

@Injectable({
    providedIn: 'root'
  })
  export class grvservice  {
private apiUrl = 'https://localhost:7218/api/SpecialityMetals_GRV';

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

      getAllGRV(): Observable<any> {
        return this.http.get<any>(this.apiUrl).pipe(
          catchError(this.handleError)
        );
      }
    
      getGRVById(id: number): Observable<GRV> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<GRV>(url).pipe(
          catchError(this.handleError)
        );
      }
    
      addGRV(grv: GRV): Observable<GRV> {
        console.log('Sending sundry:', grv); // Log the data being sent
        return this.http.post<GRV>(this.apiUrl, grv, this.httpOptions).pipe(
            catchError(error => {
                console.error('Error details:', error);
                return throwError(() => error);
            })
        );
    }
    
    updateGRV(id: number, grv: GRV): Observable<GRV> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<GRV>(url, grv, this.httpOptions).pipe(
            catchError(this.handleError)
        );
    }
    
      deleteGRV(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
          catchError(this.handleError)
        );
      }
}
