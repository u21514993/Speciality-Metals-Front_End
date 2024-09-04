import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustService } from '../../../../services/customer.service';
import { customer } from '../../../../shared/customer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-editcustomercomponent',
  standalone: true,
providers: [CustService],
imports: [
  CommonModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBarModule,
  MatDialogModule, // Import the correct module
  FormsModule ,
  HttpClientModule
],
  templateUrl: './editcustomercomponent.component.html',
  styleUrl: './editcustomercomponent.component.css'
})
export class EditcustomercomponentComponent {
  constructor(
    public dialogRef: MatDialogRef<EditcustomercomponentComponent>,
    @Inject(MAT_DIALOG_DATA) public customer: customer,
    private customerService: CustService,
    private snackBar: MatSnackBar
  ) {}

  saveCustomer(): void {
    this.customerService.updateCustomer(this.customer.customerID!, this.customer).subscribe(
      () => {
        this.snackBar.open('Customer updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(this.customer); // Close the modal and return the updated customer
      },
      (error) => {
        this.snackBar.open('Error updating customer', 'Close', { duration: 3000 });
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
