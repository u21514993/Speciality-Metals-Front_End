import { Component, OnInit } from '@angular/core';
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
  enteredCustomerName: string = ''; // User-entered customer name
  deliveryNotes: any[] = []; // Delivery notes fetched from the backend

  constructor(private reportCustService: ReportCustService) {}

  // Fetch delivery notes based on the entered customer name
  fetchDeliveryNotes(): void {
    if (this.enteredCustomerName.trim()) {
      this.reportCustService
        .getDeliveryNotesByCustomerName(this.enteredCustomerName.trim())
        .subscribe(
          (notes) => {
            this.deliveryNotes = notes; // Successfully fetched delivery notes
          },
          (error) => {
            console.error('Error fetching delivery notes:', error);
          }
        );
    } else {
      console.error('Customer name is empty. Please enter a valid name.');
    }
  }
}