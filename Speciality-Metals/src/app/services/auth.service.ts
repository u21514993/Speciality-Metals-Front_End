import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Staff } from '../shared/Staff';

export interface LoginResponse {
  message: string;
  staff: any;
  token: string;  // JWT token from backend
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Staff';

  constructor(private http: HttpClient) { }

  login(employeeCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { employeeCode }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.staff));
      })
    );
  }

  getCurrentUser(): Staff | null {
    try {
      const user = localStorage.getItem('currentUser');
      if (!user) return null;
      return JSON.parse(user);
    } catch (error) {
      // If JSON parsing fails, clear the invalid data
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
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
