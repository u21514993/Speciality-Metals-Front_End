import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { customer } from '../../../../shared/customer';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

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
  @ViewChild('fileInput') fileInput!: ElementRef;
  CustomerForm!: FormGroup;

  constructor(
    private custService: CustService,
    private snackBar: MatSnackBar,
    private router: Router // Ensure Router is injected correctly
  ) {}

  ngOnInit(): void {
    this.CustomerForm = new FormGroup({
      customer_Name: new FormControl('', [Validators.required]),
      customer_Code: new FormControl('', [Validators.required]), // Add this line
      phone_Number: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)])
    });
  }

  onSubmit(): void {
    if (this.CustomerForm.valid) {
      this.custService.addCustomer(this.CustomerForm.value).subscribe({
        next: (response) => {
          this.snackBar.open('Customer added successfully!', 'Close', { duration: 3000 });
          this.CustomerForm.reset(); // Reset the form after successful submission
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
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const workBook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetNames = workBook.SheetNames;
        const sheet = workBook.Sheets[sheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        // Process each row
        this.processExcelData(data);
      };
      reader.readAsBinaryString(file);
    }
  }

  processExcelData(data: any[]): void {
    let successCount = 0;
    let errorCount = 0;
    let totalProcessed = 0;

    data.forEach(row => {
      const customer: customer = {
        customer_Code: String(row['Customer Code']).trim(),
        customer_Name: String(row['Customer Name']).trim(),
        phone_number: String(row['Phone Number']).replace(/\D/g, '') // Remove any non-digit characters
      };

      // Add validation before sending
      if (!customer.customer_Code || !customer.customer_Name || !customer.phone_number) {
        console.error('Invalid customer data:', customer);
        errorCount++;
        totalProcessed++;
        this.checkCompletion(totalProcessed, data.length, successCount, errorCount);
        return;
      }

      console.log('Attempting to add customer:', customer);

      this.custService.addCustomer(customer).subscribe({
        next: () => {
          console.log('Successfully added customer:', customer);
          successCount++;
          totalProcessed++;
          this.checkCompletion(totalProcessed, data.length, successCount, errorCount);
        },
        error: (error) => {
          console.error('Error adding customer:', customer, error);
          errorCount++;
          totalProcessed++;
          this.checkCompletion(totalProcessed, data.length, successCount, errorCount);
        }
      });
    });
  }

  private checkCompletion(processed: number, total: number, success: number, errors: number): void {
    if (processed === total) {
      this.snackBar.open(
        `Import completed: ${success} successful, ${errors} failed`,
        'Close',
        { duration: 5000 }
      );
      this.resetFileInput();
    }
  }

  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }




  
}
