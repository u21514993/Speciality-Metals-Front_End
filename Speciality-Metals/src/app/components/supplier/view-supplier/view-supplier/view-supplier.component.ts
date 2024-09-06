import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../../../services/supplier.service';
import { Supplier } from '../../../../shared/supplier';
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
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Product } from '../../../../shared/Product';


@Component({
  selector: 'app-view-supplier',
  standalone: true,
  providers: [SupplierService, ProductService],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule, HttpClientModule, ReactiveFormsModule, MatOption, MatSelect
  ],
  templateUrl: './view-supplier.component.html',
  styleUrl: './view-supplier.component.css'
})
export class ViewSupplierComponent implements OnInit{
  suppliers: any[] = [];
  products: Product[] = []; // Holds the products for the dropdown
  displayedColumns: string[] = ['supplier_Name', 'phone_Number', 'supplierID', 'product_Name', 'actions'];
  editForm: FormGroup; // Form to handle supplier editing
  selectedSupplier: any; // The supplier being edited
  isEditPopupVisible = false; // Controls the visibility of the popup

  constructor(
    private supplierService: SupplierService,
    private productService: ProductService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      supplier_Name: ['', Validators.required],
      phone_Number: ['', Validators.required],
      productID: ['', Validators.required] // Bind to productID from the product dropdown
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts(); // Load the list of products for the dropdown
  }

  // Load suppliers and fetch their product names using the custom endpoint
  private loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;

        // For each supplier, fetch the associated product name
        this.suppliers.forEach(supplier => {
          this.supplierService.getProductNameBySupplierId(supplier.supplierID).subscribe({
            next: (productName) => {
              supplier.product_Name = productName; // Attach the product name to the supplier object
            },
            error: () => {
              supplier.product_Name = 'Unknown'; // Fallback if there's an error
            }
          });
        });
      },
      error: () => {
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
      }
    });
  }

  // Load all products for the product dropdown using ProductService
  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data; // Ensure products array is populated with the correct structure
      },
      error: () => {
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  // Delete supplier
  deleteSupplier(id: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.snackBar.open('Supplier deleted successfully!', 'Close', { duration: 3000 });
          this.loadSuppliers(); // Reload the supplier list after deletion
        },
        error: () => {
          this.snackBar.open('Failed to delete supplier', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Open the edit popup
  openEditPopup(supplier: any): void {
    this.selectedSupplier = supplier;
    this.isEditPopupVisible = true;

    // Populate the form with the supplier's data
    this.editForm.patchValue({
      supplier_Name: supplier.supplier_Name,
      phone_Number: supplier.phone_Number,
      productID: supplier.productID // Use productID from the supplier for editing
    });
  }

  // Close the edit popup
  closeEditPopup(): void {
    this.isEditPopupVisible = false;
    this.editForm.reset(); // Reset the form
  }

  // Save the edited supplier
  saveSupplier(): void {
    if (this.editForm.valid) {
      const updatedSupplier = { ...this.selectedSupplier, ...this.editForm.value };
      this.supplierService.updateSupplier(this.selectedSupplier.supplierID, updatedSupplier).subscribe({
        next: () => {
          this.snackBar.open('Supplier updated successfully!', 'Close', { duration: 3000 });
          this.loadSuppliers(); // Reload suppliers
          this.closeEditPopup(); // Close the popup after saving
        },
        error: () => {
          this.snackBar.open('Failed to update supplier', 'Close', { duration: 3000 });
        }
      });
    }
  }
}