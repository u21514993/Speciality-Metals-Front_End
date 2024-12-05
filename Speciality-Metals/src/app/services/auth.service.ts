import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Staff } from '../shared/Staff';

export interface LoginResponse {
  message: string;
  staff: Staff;  // Type this properly as Staff
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7218/api/SpecialityMetals_Staff';
  private currentUserSubject = new BehaviorSubject<Staff | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize the current user from localStorage on service creation
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      }
    }
  }

  login(employeeCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { employeeCode }).pipe(
      tap(response => {
        if (response && response.token && response.staff) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.staff));
          this.currentUserSubject.next(response.staff);
        }
      })
    );
  }

  getCurrentUser(): Staff | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Rest of your service methods remain the same
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