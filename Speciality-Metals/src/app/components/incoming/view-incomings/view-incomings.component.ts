import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; // Ensure form field module is imported
import { MatInputModule } from '@angular/material/input'; // Ensure input module is imported
import { IncomingService } from '../../../services/incoming.service'; // Update the path
import { incoming } from '../../../shared/incoming';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-view-incomings',
  standalone: true,
  templateUrl: './view-incomings.component.html',
  styleUrls: ['./view-incomings.component.css'],
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule, // Include form field module for Material design
    MatInputModule, // Include input module for Material form inputs
    ReactiveFormsModule, // Ensure Reactive Forms are enabled
  ],
  providers: [IncomingService],
})
export class ViewIncomingsComponent implements OnInit {
  // Form to add a new incoming product
  addIncomingForm!: FormGroup;
  showAddForm = false;

  // Angular Material Data Source for the Table
  incomings = new MatTableDataSource<incoming>([]);

  // Columns to be displayed in the table
  displayedColumns: string[] = [
    'incomingID',
    'incoming_Date',
    'gross_Weight',
    'tare_Weight',
    'net_Weight',
    'grV_Number',
    'supplierID',
    'productID',
    'actions',
  ];

  // Paginator for the table
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private incomingService: IncomingService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadIncomings();

    // Initialize the form group
    this.addIncomingForm = this.fb.group({
      gross_Weight: ['', Validators.required],
      tare_Weight: ['', Validators.required],
      net_Weight: ['', Validators.required],
      grV_Number: ['', Validators.required],
      supplierID: ['', Validators.required],
      productID: ['', Validators.required],
    });
  }

  // Toggle Add Form
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  //READ THE INCOMING PRODUCTS------->(R)
  loadIncomings(): void {
    this.incomingService.getIncomings().subscribe(
      (data: incoming[]) => {
        this.incomings.data = data;
        this.incomings.paginator = this.paginator;
      },
      (error) => {
        console.error('Error fetching incomings', error);
      }
    );
  }

  //ADD THE INCOMING PRODUCTS------>(C)
  onAddSubmit(): void {
    if (this.addIncomingForm.valid) {
      const newIncoming: incoming = {
        ...this.addIncomingForm.value,
        incoming_Date: new Date(), // Automatically set the current date
      };

      this.incomingService.addIncoming(newIncoming).subscribe(
        (addedIncoming: incoming) => {
          this.loadIncomings(); // Reload the table after adding
          this.addIncomingForm.reset(); // Reset the form after submission
          this.showAddForm = false; // Hide the form after submission
        },
        (error) => {
          console.error('Error adding incoming product:', error);
        }
      );
    }
  }

  //DELETE THE INCOMING PRODUCTS--------------->(D)
  deleteIncoming(incomingID: number): void {
    if (confirm('Are you sure you want to delete this incoming product?')) {
      this.incomingService.deleteIncoming(incomingID).subscribe(
        () => {
          this.loadIncomings(); // Reload the table after deleting
        },
        (error) => {
          console.error('Error deleting incoming product:', error);
        }
      );
    }
  }
}
