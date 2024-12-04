import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductReportService } from '../../services/ProductReport.service';
import { ReportProduct } from '../../services/ProductReport.service';
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
  selector: 'app-report-product',
  standalone: true,
  providers: [ProductReportService],
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
  templateUrl: './report-product.component.html',
  styleUrl: './report-product.component.css'
})
export class ReportProductComponent {
  productName: string = ''; // To bind the product name from the input field
  deliveryNotes: ReportProduct[] = []; // To store the fetched delivery notes

  constructor(
    private productReportService: ProductReportService,
    private snackBar: MatSnackBar
  ) {}

  // Fetch delivery notes for the entered product name
  fetchDeliveryNotes(): void {
    if (this.productName.trim() === '') {
      this.snackBar.open('Please enter a product name.', 'Close', { duration: 3000 });
      return;
    }

    this.productReportService.getDeliveryNotesByProductName(this.productName).subscribe(
      (notes) => {
        this.deliveryNotes = notes; // Store the results
        if (notes.length === 0) {
          this.snackBar.open('No delivery notes found for this product.', 'Close', { duration: 3000 });
        }
      },
      (error) => {
        console.error('Error fetching delivery notes:', error);
        this.snackBar.open('An error occurred while fetching data.', 'Close', { duration: 3000 });
      }
    );
  }
}