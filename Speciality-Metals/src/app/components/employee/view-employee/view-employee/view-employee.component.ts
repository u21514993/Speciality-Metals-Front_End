import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';
import { Staff } from '../../../../shared/Staff';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule

@Component({
  selector: 'app-view-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    HttpClientModule,
    MatTableModule,],
  templateUrl: './view-employee.component.html',
  styleUrl: './view-employee.component.css',
  providers: [AuthService],
})
export class ViewEmployeeComponent  implements OnInit{
  employeeForm!: FormGroup;
  employees: Staff[] = []; // Array to hold the employee data
  displayedColumns: string[] = ['employee_Name', 'employee_Age', 'iD_Number', 'employee_Code', 'employee_Type_ID']; // Columns to be displayed
  employeeTypes = [
    { id: 1, name: 'Owner' },
    { id: 2, name: 'Employee' },
    { id: 3, name: 'Admin' }
  ];
  constructor(
    private fb: FormBuilder,
    private staffService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      employee_Name: ['', Validators.required],
      employee_Age: ['', [Validators.required, Validators.min(18)]],
      iD_Number: ['', Validators.required],
      employee_Code: ['', Validators.required],
      employee_Type_ID: ['', Validators.required]
    });

    this.loadEmployees(); // Load employees on component initialization
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const newStaff: Staff = this.employeeForm.value;
      this.staffService.addStaff(newStaff).subscribe({
        next: () => {
          this.snackBar.open('Employee added successfully!', 'Close', { duration: 3000 });
          this.loadEmployees(); // Reload the employee list after adding a new employee
        },
        error: () => this.snackBar.open('Failed to add employee', 'Close', { duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.employeeForm.reset();
  }

  private loadEmployees(): void {
    this.staffService.getAllStaff().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: () => this.snackBar.open('Failed to load employees', 'Close', { duration: 3000 })
    });
  }
}
