import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { CustService } from '../../../../services/customer.service';
import { customer } from '../../../../shared/customer';
import { MatDialog } from '@angular/material/dialog';
import { EditcustomercomponentComponent } from '../../edit-customer/editcustomercomponent/editcustomercomponent.component';


//import { addIcons } from "ionicons";

@Component({
  selector: 'app-view-customer',
  standalone: true,
  providers: [CustService],
  imports: [CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule, HttpClientModule],
  templateUrl: './view-customer.component.html',
  styleUrl: './view-customer.component.css'
})
export class ViewCustomerComponent implements OnInit{
  customers: customer[]=[]
  displayedColumns: string[] = ['customer_Name', 'phone_number', 'actions'];
  constructor(
    private customerService: CustService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe(
      (data) => {
        this.customers = data;
      },
      (error) => {
        this.snackBar.open('Error loading customers', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  deleteCustomer(id: number): void {
    this.customerService.deleteCustomer(id).subscribe(
      () => {
        this.snackBar.open('Customer deleted successfully', 'Close', {
          duration: 3000,
        });
        this.loadCustomers(); // Reload customers after deletion
      },
      (error) => {
        this.snackBar.open('Error deleting customer', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  openEditCustomerDialog(customer: customer): void {
    const dialogRef = this.dialog.open(EditcustomercomponentComponent, {
      width: '400px',
      data: { ...customer } // Pass a copy of the customer data to the dialog
    });

    // Handle after the dialog closes
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCustomers(); // Reload customers if any updates were made
      }
    });
  }
}
