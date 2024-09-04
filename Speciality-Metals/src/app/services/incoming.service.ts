import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { incoming } from '../shared/incoming'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root'
})
export class IncomingService {

  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Incoming';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Get all incoming records
  getIncomings(): Observable<incoming[]> {
    return this.http.get<incoming[]>(this.apiUrl);
  }

  // Get a single incoming record by ID
  getIncomingById(id: number): Observable<incoming> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<incoming>(url);
  }

  // Add a new incoming record
  addIncoming(incoming: incoming): Observable<incoming> {
    return this.http.post<incoming>(this.apiUrl, incoming, this.httpOptions);
  }

  // Update an existing incoming record
  updateIncoming(id: number, incoming: incoming): Observable<incoming> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<incoming>(url, incoming, this.httpOptions);
  }

  // Delete an incoming record
  deleteIncoming(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions);
  }
}
