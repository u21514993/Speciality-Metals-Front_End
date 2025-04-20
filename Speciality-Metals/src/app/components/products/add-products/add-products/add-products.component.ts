import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/Product';
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
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressBar } from '@angular/material/progress-bar';
import * as XLSX from 'xlsx';
import { forkJoin, from, mergeMap, of } from 'rxjs';

@Component({
  selector: 'app-add-products',
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
    MatInputModule, ReactiveFormsModule, HttpClientModule,
    MatProgressBar
  ],
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.css'
})
export class AddProductsComponent implements OnInit{
  productForm!: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  progress = 0;
  totalProducts = 0;
  processedProducts = 0;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      product_Name: ['', Validators.required],
      product_Code: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = {
        productID: 0, // This will be assigned by the backend
        ...this.productForm.value
      };
      
      this.productService.addProduct(newProduct).subscribe({
        next: () => {
          this.snackBar.open('Product added successfully!', 'Close', { duration: 3000 });
          this.productForm.reset();
        },
        error: () => this.snackBar.open('Failed to add product', 'Close', { duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.productForm.reset();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    
    this.isUploading = true;
    this.progress = 0;
    this.processedProducts = 0;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Assume the first sheet contains the products
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON
      const productsJson = XLSX.utils.sheet_to_json(worksheet);
      this.totalProducts = productsJson.length;
      
      if (this.totalProducts === 0) {
        this.snackBar.open('No products found in the Excel file', 'Close', { duration: 3000 });
        this.isUploading = false;
        return;
      }
      
      // Process each product one by one
      from(productsJson).pipe(
        mergeMap((item: any) => {
          // Create a product object from the Excel row
          const product: Product = {
            productID: 0, // Will be assigned by the backend
            product_Name: item.product_Name,
            product_Code: item.product_Code
          };
          
          // Add the product and track progress
          return this.productService.addProduct(product).pipe(
            mergeMap(result => {
              this.processedProducts++;
              this.progress = Math.round((this.processedProducts / this.totalProducts) * 100);
              return of(result);
            })
          );
        }, 3) // Process up to 3 products concurrently
      ).subscribe({
        complete: () => {
          this.snackBar.open(`${this.processedProducts} products imported successfully!`, 'Close', { duration: 3000 });
          this.selectedFile = null;
          this.isUploading = false;
        },
        error: (error) => {
          this.snackBar.open('Error importing products: ' + error.message, 'Close', { duration: 5000 });
          this.isUploading = false;
        }
      });
    };
    
    reader.readAsArrayBuffer(this.selectedFile);
  }
}