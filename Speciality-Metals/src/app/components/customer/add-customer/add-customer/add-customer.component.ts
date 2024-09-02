import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustService } from '../../../../services/customer.service';
import { Router } from '@angular/router'; // Ensure Router is imported
import { HttpErrorResponse } from '@angular/common/http'; // Correct the import path
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.css',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule, 
    ReactiveFormsModule, 
    HttpClientModule],
    providers: [CustService]
})
export class AddCustomerComponent implements OnInit {
  CustomerForm!: FormGroup;

  constructor(
    private custService: CustService,
    private snackBar: MatSnackBar,
    private router: Router // Ensure Router is injected correctly
  ) {}

  ngOnInit(): void {
    this.CustomerForm = new FormGroup({
      customer_Name: new FormControl('', [Validators.required]),
      phone_Number: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    });
  }

  onSubmit(): void {
    if (this.CustomerForm.valid) {
      this.custService.addCustomer(this.CustomerForm.value).subscribe({
        next: (response) => {
          this.snackBar.open('Customer added successfully!', 'Close', { duration: 3000 });
        },
        error: (err: HttpErrorResponse) => {
          this.snackBar.open('Failed to add customer. Please try again.', 'Close', { duration: 3000 });
          console.error('Error adding customer:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.CustomerForm.reset();
  }
}
