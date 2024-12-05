import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { sundryservice } from '../../../services/sundry.service';
import { Product } from '../../../shared/Product';
import { sundry } from '../../../shared/sundry';
import { AuthService } from '../../../services/auth.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-sundry',
  standalone: true,
  imports: [
    
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  providers:[
    sundryservice,
    AuthService
  ],
  templateUrl: './sundry.component.html',
  styleUrl: './sundry.component.css'
})
export class SundryComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  
  addSundryForm!: FormGroup;
  sundryNotes: any[] = [];
  products: Product[] = [];
  filteredSundryNotes: Observable<sundry[]> = new Observable<sundry[]>();
  sundryNotesOptions: string[] = [];
  displayedColumns: string[] = [
    'sundryID',
    'productCode',
    'productName', 
    'gross_Weight',
    'tare_Weight',
    'net_Weight',
    'time',
    'sundry_Date',
    'operator'
  ];
  dataSource!: MatTableDataSource<any>; // Changed to any to accommodate mapped data
  currentUserEmployeeID: string = '';
  uniqueSundryNoteIds: number[] = [];
  constructor(
    private fb: FormBuilder,
    private sundryService: sundryservice,
    private authService: AuthService
  ) {
    this.initializeForm();
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit() {
    console.log('Component initializing...');
    this.loadSundryNotesForDropdown();
    this.loadProducts();
    this.setupWeightCalculation();
    this.loadSundryData(); // Add this line
  }

  private initializeForm() {
    this.addSundryForm = this.fb.group({
      sundry_Note_ID: ['', Validators.required],
      comments: [''],
      productName: [''],
      productCode: [''],
      gross_Weight: [0, [Validators.required, Validators.min(0)]],
      tare_Weight: [0, [Validators.required, Validators.min(0)]],
      net_Weight: [{ value: 0, disabled: true }]
    });
  


    this.addSundryForm.get('productName')?.valueChanges.subscribe(name => {
      const product = this.products.find(p => p.product_Name === name);
      if (product) {
        this.addSundryForm.patchValue({
          productCode: product.product_Code
        }, { emitEvent: false });
      }
    });

    this.addSundryForm.get('productCode')?.valueChanges.subscribe(code => {
      const product = this.products.find(p => p.product_Code === code);
      if (product) {
        this.addSundryForm.patchValue({
          productName: product.product_Name
        }, { emitEvent: false });
      }
    });
  }

  
  private loadSundryNotesForDropdown() {
    console.log('Loading data with forkJoin...');
    
    forkJoin({
      sundries: this.sundryService.getAllSundry(),
      sundryNotes: this.sundryService.getSundryNotes()
    }).subscribe({
      next: (result) => {
        console.log('ForkJoin result:', result);
        
        // Just assign all sundry notes without filtering
        this.sundryNotes = result.sundryNotes;
        
        // Log the loaded notes to verify
        console.log('Loaded sundry notes:', this.sundryNotes);
      },
      error: (error) => console.error('ForkJoin error:', error)
    });
  }


private _filterSundryNotes(value: string): sundry[] {
  const filterValue = value.toLowerCase();
  return this.sundryNotes.filter(note => 
    note.sundry_Note_ID.toString().toLowerCase().includes(filterValue)
  );
}

  private getProductCode(productID: number): string {  // Fix error #2 - change type to number
    const product = this.products.find(p => p.productID === productID);
    return product?.product_Code || 'N/A';
  }

  private getProductName(productID: number): string {  // Fix error #3 - change type to number
    const product = this.products.find(p => p.productID === productID);
    return product?.product_Name || 'N/A';
  }

  private loadProducts() {
    this.sundryService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  private setupWeightCalculation() {
    this.addSundryForm.get('gross_Weight')?.valueChanges.subscribe(() => {
      this.calculateNetWeight();
    });
    this.addSundryForm.get('tare_Weight')?.valueChanges.subscribe(() => {
      this.calculateNetWeight();
    });
  }

  private calculateNetWeight() {
    const grossWeight = this.addSundryForm.get('gross_Weight')?.value || 0;
    const tareWeight = this.addSundryForm.get('tare_Weight')?.value || 0;
    const netWeight = grossWeight - tareWeight;
    this.addSundryForm.patchValue({ net_Weight: netWeight });
  }

  onAddSubmit(): void {
    const sundryNoteId = +this.addSundryForm.get('sundry_Note_ID')?.value;
    console.log('Form sundry_Note_ID value:', sundryNoteId);
  
    const selectedSundryNote = this.sundryNotes.find(
      note => note.sundry_Notes_ID === sundryNoteId
    );
    console.log('Selected sundry note:', selectedSundryNote);
  
    if (!selectedSundryNote) {
      alert('No valid sundry note selected. Please try again.');
      return;
    }
    const currentUser = this.authService.getCurrentUser();
  if (!currentUser) {
    console.error('No user is logged in!');
    return;
  }
  
    const sundryData = {
      sundry_Note_ID: this.addSundryForm.get('sundry_Note_ID')?.value,
      productID: this.products.find(
        p => p.product_Code === this.addSundryForm.get('productCode')?.value
      )?.productID,
      gross_Weight: this.addSundryForm.get('gross_Weight')?.value,
      tare_Weight: this.addSundryForm.get('tare_Weight')?.value,
      net_Weight: this.addSundryForm.get('net_Weight')?.value,
      comments: this.addSundryForm.get('comments')?.value,
      sundry_Date: new Date(),
      employeeID: currentUser.staffID, // Use staffID from current user
    };
  
    console.log('Submitting sundry data:', sundryData);
  
    this.sundryService.addSundry(sundryData).subscribe({
      next: () => {
        console.log('Sundry added successfully.');
        this.addSundryForm.reset();
        this.loadSundryData();
      },
      error: error => console.error('Failed to add sundry:', error)
    });
  }
  printLabel() {
    console.log('Printing label...');
  }

  printTable() {
    window.print();
  }

  exportToExcel() {
    
  }

  private loadSundryData() {
    this.sundryService.getAllSundry().subscribe({
      next: (data) => {
        // Map the data to include product names and codes
        const mappedData = data.map((sundry: any) => {
          const product = this.products.find(p => p.productID === sundry.productID);
          return {
            ...sundry,
            productName: product?.product_Name || 'N/A',
            productCode: product?.product_Code || 'N/A'
          };
        });
        
        this.dataSource = new MatTableDataSource(mappedData);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => console.error('Error loading sundry data:', error)
    });
}
}
