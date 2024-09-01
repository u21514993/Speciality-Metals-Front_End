import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [  MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule, ReactiveFormsModule, HttpClientModule ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
  providers: [AuthService],
})
export class EmployeesComponent {
  employeeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      employeeName: ['', Validators.required],
      employeeAge: ['', Validators.required],
      idNumber: ['', Validators.required],
      employeeCode: ['', Validators.required],
    });
  }

  generateRandomCode() {
    const randomCode = Math.random().toString(36).substr(2, 8).toUpperCase(); // Generate random 8-character code
    this.employeeForm.patchValue({ employeeCode: randomCode });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      this.authService.addEmployee(formData).subscribe(
        response => {
          this.snackBar.open('Employee added successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
          this.router.navigate(['/home']);
        },
        error => {
          this.snackBar.open('Failed to add employee.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        }
      );
    }
  }
}

