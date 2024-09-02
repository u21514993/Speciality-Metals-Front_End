import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../app/services/product.service';
import { Product } from '../../../../app/shared/Product';
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

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.css'],
  providers: [ProductService],
  standalone: true,
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
    MatInputModule, HttpClientModule
  ]
})
export class ViewProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['Product_Name', 'actions']; // Match the display order

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

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
}