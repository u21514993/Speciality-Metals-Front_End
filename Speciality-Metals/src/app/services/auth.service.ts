import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Staff } from '../shared/Staff';

export interface LoginResponse {
  message: string;
  staff: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Staff';

  constructor(private http: HttpClient) { }

  login(employeeCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { employeeCode });
  }
  getAllStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}`);
  }

  getStaffById(id: number): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`);
  }

  addStaff(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(this.apiUrl, staff);
  }

  updateStaff(id: number, staff: Staff): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, staff);
  }

  deleteStaff(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
