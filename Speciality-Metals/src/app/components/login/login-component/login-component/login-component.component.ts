import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { MatSnackBar, MatSnackBarAction } from '@angular/material/snack-bar';
import { Router } from '@angular/router';  // Correct import from Angular
import { Observable } from 'rxjs';
import { Staff } from '../../../../shared/Staff';
@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSnackBarAction],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.css',
  providers: [AuthService],
})
export class LoginComponentComponent {
  loginForm: FormGroup;
  loginError: string | null = null;
  currentUser$: Observable<Staff | null>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      employeeCode: ['', Validators.required],
    });
    this.currentUser$ = this.authService.currentUser$;
  }
  

  onSubmit() {
    if (this.loginForm.valid) {
      const employeeCode = this.loginForm.get('employeeCode')?.value;
      this.authService.login(employeeCode).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          const user = this.authService.getCurrentUser();
          console.log('Current user:', user);  // Verify user is stored
          this.loginError = null;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.loginError = 'Login failed. Please try again.';
          this.snackBar.open('Login failed', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        }
      });
    }
  }
}
