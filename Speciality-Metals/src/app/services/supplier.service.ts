import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../shared/Supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Supplier';

  constructor(private http: HttpClient) { }

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}`);
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
