import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../../app/services/product.service';
import { Product } from '../../../../app/shared/Product';
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

@Component({
  selector: 'app-add-product',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css'],
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
    MatInputModule, ReactiveFormsModule, HttpClientModule
  ]
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      Product_Name: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = this.productForm.value;
      this.productService.addProduct(newProduct).subscribe({
        next: () => {
          this.snackBar.open('Product added successfully!', 'Close', { duration: 3000 });
          this.productForm.reset(); // Reset the form after successful submission
        },
        error: () => this.snackBar.open('Failed to add product', 'Close', { duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.productForm.reset();
  }
}