import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/Product';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-view-products',
  standalone: true,
  providers: [ProductService],
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
    MatInputModule, ReactiveFormsModule],
  templateUrl: './view-products.component.html',
  styleUrl: './view-products.component.css'
})
export class ViewProductsComponent implements OnInit{
  products: Product[] = [];
  displayedColumns: string[] = ['Product_Name', 'actions']; // Match the display order
  isEditPopupVisible = false; // Controls the visibility of the popup
  editForm: FormGroup; // Form to handle product editing
  selectedProduct!: Product; // The product being edited

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      Product_Name: ['', Validators.required] // Form control for product name
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
          this.loadProducts(); // Reload the product list after deletion
        },
        error: () => {
          this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Open the edit popup and populate the form with the selected product
  openEditPopup(product: Product): void {
    this.selectedProduct = product;
    this.isEditPopupVisible = true;

    // Populate the form with the product's data
    this.editForm.patchValue({
      Product_Name: product.product_Name
    });
  }

  // Close the edit popup
  closeEditPopup(): void {
    this.isEditPopupVisible = false;
    this.editForm.reset(); // Reset the form when closing
  }

  // Save the updated product
  saveProduct(): void {
    if (this.editForm.valid) {
      const updatedProduct = {
        ...this.selectedProduct,
        ...this.editForm.value // Merge the form values into the selected product
      };

      this.productService.updateProduct(this.selectedProduct.ProductID, updatedProduct).subscribe({
        next: () => {
          this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
          this.loadProducts(); // Reload the products list after updating
          this.closeEditPopup(); // Close the popup after saving
        },
        error: () => {
          this.snackBar.open('Failed to update product', 'Close', { duration: 3000 });
        }
      });
    }
  }
}