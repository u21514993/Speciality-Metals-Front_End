import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';  // Correct import from Angular

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService],
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null; // Property to hold the error message

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,           // Inject Angular Router
    private snackBar: MatSnackBar     // Inject MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      employeeCode: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const employeeCode = this.loginForm.get('employeeCode')?.value;
      this.authService.login(employeeCode).subscribe(
        response => {
          console.log('Login successful:', response);
          this.loginError = null;  // Clear any previous errors
          this.router.navigate(['/home']);  // Navigate to home page on successful login
        },
        error => {
          console.error('Login failed:', error);
          this.loginError = 'FUCK OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';  // Set the error message to be displayed

          // Optionally, display the error using MatSnackBar
          this.snackBar.open('FUCK OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        }
      );
    }
  }
}
