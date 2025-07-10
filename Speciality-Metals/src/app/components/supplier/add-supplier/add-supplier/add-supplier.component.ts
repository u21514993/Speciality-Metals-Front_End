import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupplierService } from '../../../../services/supplier.service';
import { ProductService } from '../../../../services/product.service';
import { Supplier } from '../../../../shared/supplier';
import { Product } from '../../../../shared/Product';
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
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, startWith, map } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [
    CommonModule,
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
    MatTableModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.css',
  providers: [SupplierService, ProductService],
})
export class AddSupplierComponent implements OnInit {
  supplierForm!: FormGroup;
  suppliers: Supplier[] = [];
  products: Product[] = [];
  filteredProducts: Observable<Product[]> | undefined;
  selectedProducts: Product[] = [];
  displayedColumns: string[] = ['supplier_Name', 'phone_Number', 'supplierID', 'productID'];
  
  // Excel upload properties
  isUploading = false;
  uploadProgress = 0;
  excelFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSuppliers();
    this.loadProducts();
  }

  private initializeForm(): void {
    this.supplierForm = this.fb.group({
      supplier_Name: ['', Validators.required],
      phone_Number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      supplierID: ['', Validators.required],
      supplier_Code: [''],
      productSearch: ['']
    });

    // Setup product search filtering
    this.filteredProducts = this.supplierForm.get('productSearch')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterProducts(value || ''))
    );
  }

  private _filterProducts(value: string): Product[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product => 
      product.product_Name.toLowerCase().includes(filterValue) ||
      product.product_Code?.toLowerCase().includes(filterValue)
    );
  }

  onProductSelected(product: Product): void {
    // Check if product is already selected
    if (!this.selectedProducts.find(p => p.productID === product.productID)) {
      this.selectedProducts.push(product);
    }
    
    // Clear the search field
    this.supplierForm.get('productSearch')?.setValue('');
  }

  removeProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
  }

  onSubmit(): void {
    if (this.supplierForm.valid && this.selectedProducts.length > 0) {
      // For each selected product, create a supplier record
      const supplierPromises = this.selectedProducts.map(product => {
        const supplierData = {
          supplier_Name: this.supplierForm.get('supplier_Name')?.value,
          phone_Number: this.supplierForm.get('phone_Number')?.value,
          supplierID: this.supplierForm.get('supplierID')?.value,
          supplier_Code: this.supplierForm.get('supplier_Code')?.value,
          productID: product.productID // Send just the ID
        };

        return this.supplierService.addSupplier(supplierData).toPromise();
      });

      Promise.all(supplierPromises).then(() => {
        this.snackBar.open('Supplier(s) added successfully!', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadSuppliers();
      }).catch(() => {
        this.snackBar.open('Failed to add supplier(s)', 'Close', { duration: 3000 });
      });
    } else if (this.selectedProducts.length === 0) {
      this.snackBar.open('Please select at least one product', 'Close', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.supplierForm.reset();
    this.selectedProducts = [];
  }

  // Excel file handling
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.excelFile = file;
    } else {
      this.snackBar.open('Please select a valid Excel file (.xlsx)', 'Close', { duration: 3000 });
    }
  }

  onUploadExcel(): void {
    if (!this.excelFile) {
      this.snackBar.open('Please select an Excel file first', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        this.processExcelData(jsonData);
      } catch (error) {
        this.snackBar.open('Error reading Excel file', 'Close', { duration: 3000 });
        this.isUploading = false;
      }
    };

    reader.readAsArrayBuffer(this.excelFile);
  }

  private processExcelData(data: any[]): void {
    const allSuppliers: any[] = [];
    
    data.forEach(row => {
      const productNames = this.parseProductNames(row['Products'] || row['products'] || '');
      const productIDs = this.mapProductNamesToIDs(productNames);
      
      // Create a supplier record for each product
      productIDs.forEach(productID => {
        allSuppliers.push({
          supplier_Name: row['Supplier Name'] || row['supplier_Name'],
          phone_Number: row['Phone Number'] || row['phone_Number'],
          supplier_Code: row['Supplier Code'] || row['supplier_Code'],
          productID: productID // Just the ID
        });
      });
    });

    // Send all suppliers to backend
    this.supplierService.bulkUploadSuppliers(allSuppliers).subscribe({
      next: (response) => {
        this.uploadProgress = 100;
        this.snackBar.open(`Successfully uploaded ${response.successCount} supplier-product combinations`, 'Close', { duration: 3000 });
        this.loadSuppliers();
        this.isUploading = false;
        this.excelFile = null;
      },
      error: (error) => {
        this.snackBar.open('Failed to upload suppliers', 'Close', { duration: 3000 });
        this.isUploading = false;
      }
    });
  }

  private parseProductNames(productString: string): string[] {
    return productString.split(',').map(name => name.trim()).filter(name => name.length > 0);
  }

  private mapProductNamesToIDs(productNames: string[]): number[] {
    return productNames
      .map(name => {
        const product = this.products.find(p => 
          p.product_Name.toLowerCase() === name.toLowerCase() ||
          p.product_Code?.toLowerCase() === name.toLowerCase()
        );
        return product ? product.productID : null;
      })
      .filter(id => id !== null) as number[];
  }

  // Helper method to get product name by ID for display
  getProductName(productID: number): string {
    const product = this.products.find(p => p.productID === productID);
    return product ? product.product_Name : 'Unknown Product';
  }

  downloadTemplate(): void {
    const template = [
      {
        'Supplier Name': 'Example Supplier',
        'Phone Number': '1234567890',
        'Supplier Code': 'SUP001',
        'Products': 'Product 1, Product 2, Product 3'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');
    XLSX.writeFile(wb, 'supplier_template.xlsx');
  }

  private loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: () => this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 })
    });
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => this.snackBar.open('Failed to load products', 'Close', { duration: 3000 })
    });
  }
}