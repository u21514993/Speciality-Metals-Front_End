import { Component } from '@angular/core';
import { ReportCustService } from '../../services/reportcust.service';
import { ReportCust } from '../../shared/ReportCust';
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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-report-cust',
  standalone: true,
  providers: [ReportCustService],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    RouterModule,
    MatFormFieldModule,HttpClientModule,
    MatInputModule, ReactiveFormsModule, FormsModule

  ],
  templateUrl: './report-cust.component.html',
  styleUrl: './report-cust.component.css'
})
export class ReportCustComponent {
  customers: string[] = [];  // List of customer names for the dropdown
  selectedCustomerName: string = '';  // Bind this to the dropdown selection
  deliveryNotes: any[] = [];  // Store delivery notes for the selected customer

  constructor(private reportCustService: ReportCustService) {}

  ngOnInit(): void {
    // Fetch all customers on initialization to populate the dropdown
    this.reportCustService.getCustomers().subscribe((customerName) => {
      this.customers = customerName;
    });
  }

  // Method to fetch delivery notes based on selected customer name
  fetchDeliveryNotes(): void {
    // Ensure that the selected customer name is a string, not an object
    if (this.selectedCustomerName) {
      this.reportCustService.getDeliveryNotesByCustomerName(this.selectedCustomerName).subscribe(
        (notes) => {
          this.deliveryNotes = notes;  // Store the delivery notes
        },
        (error) => {
          console.error('Error fetching delivery notes:', error);  // Handle errors
        }
      );
    }
  }
  
}