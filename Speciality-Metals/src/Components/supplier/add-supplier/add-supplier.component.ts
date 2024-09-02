import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupplierService } from '../../../app/services/supplier.service';
import { Supplier } from '../../../app/shared/Supplier';
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
  selector: 'app-add-supplier',
  standalone: true,
  imports: [CommonModule,
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
    MatTableModule],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.css',
  providers: [SupplierService],
})
export class AddSupplierComponent {
  supplierForm!: FormGroup;
  suppliers: Supplier[] = [];
  displayedColumns: string[] = ['supplier_Name', 'phone_Number', 'supplierID', 'productID'];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.supplierForm = this.fb.group({
      supplier_Name: ['', Validators.required],
      phone_Number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], // Assuming phone numbers are 10 digits
      supplierID: ['', Validators.required],
      productID: ['', Validators.required]
    });

    this.loadSuppliers();
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      const newSupplier: Supplier = this.supplierForm.value;
      this.supplierService.addSupplier(newSupplier).subscribe({
        next: () => {
          this.snackBar.open('Supplier added successfully!', 'Close', { duration: 3000 });
          this.loadSuppliers();
        },
        error: () => this.snackBar.open('Failed to add supplier', 'Close', { duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.supplierForm.reset();
  }

  private loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: () => this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 })
    });
  }
}
