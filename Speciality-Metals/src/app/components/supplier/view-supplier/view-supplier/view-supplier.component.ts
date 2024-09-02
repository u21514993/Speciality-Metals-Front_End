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
@Component({
  selector: 'app-view-supplier',
  standalone: true,
  providers: [SupplierService],
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
  ],
  templateUrl: './view-supplier.component.html',
  styleUrl: './view-supplier.component.css'
})
export class ViewSupplierComponent implements OnInit{
  suppliers: Supplier[] = [];
  displayedColumns: string[] = ['supplier_Name', 'phone_Number', 'supplierID', 'productID', 'actions'];

  constructor(
    private supplierService: SupplierService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: () => {
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
      }
    });
  }

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

}
