import { Component } from '@angular/core';
import { WeightDetailsService } from '../../services/WeightDetails.service';
import { WeightDetails } from '../../shared/WeightDetails';
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
  selector: 'app-weight-report',
  standalone: true,
  providers: [WeightDetailsService],
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
  templateUrl: './weight-report.component.html',
  styleUrl: './weight-report.component.css'
})
export class WeightReportComponent {
  weightDetails: WeightDetails[] = [];
  isLoading: boolean = false;
  currentType: 'Incoming' | 'Outgoing' | null = null;

  constructor(private weightDetailsService: WeightDetailsService) {}

  fetchWeightDetails(type: 'Incoming' | 'Outgoing'): void {
    this.isLoading = true;
    this.currentType = type;

    if (type === 'Incoming') {
      this.weightDetailsService.getIncomingWeightDetails().subscribe({
        next: (data) => {
          this.weightDetails = data;
          this.isLoading = false;
        },
        error: () => {
          alert('Error fetching incoming details');
          this.isLoading = false;
        },
      });
    } else if (type === 'Outgoing') {
      this.weightDetailsService.getOutgoingWeightDetails().subscribe({
        next: (data) => {
          this.weightDetails = data;
          this.isLoading = false;
        },
        error: () => {
          alert('Error fetching outgoing details');
          this.isLoading = false;
        },
      });
    }
  }

  /**
   * Helper function to format decimals and handle null values.
   */
  formatDecimal(value: number | null): string {
    return value !== null && value !== undefined ? value.toFixed(2) : '0.00';
  }
}