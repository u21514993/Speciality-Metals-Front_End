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
  currentOperator: string = '';
  uniqueSundryNoteIds: number[] = [];
  constructor(
    private fb: FormBuilder,
    private sundryService: sundryservice,
    private authService: AuthService
  ) {
    this.initializeForm();
    this.currentOperator = this.authService.getCurrentUser()?.employee_Name || 'Unknown';
  }

  ngOnInit() {
    console.log('Component initializing...');
    this.loadSundryNotesForDropdown();
    this.loadProducts();
    this.setupWeightCalculation();
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
        
        const uniqueNoteIds = result.sundries.length 
          ? [...new Set(result.sundries.map((s: { sundry_Note_ID: number }) => s.sundry_Note_ID))]
          : []; // Handle empty sundries
  
        this.sundryNotes = uniqueNoteIds.length 
          ? result.sundryNotes.filter((note: { sundry_Notes_ID: number }) => uniqueNoteIds.includes(note.sundry_Notes_ID))
          : result.sundryNotes; // If no IDs, keep all sundryNotes
  
        console.log('Filtered sundry notes:', this.sundryNotes);
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
    console.log('Form Value:', this.addSundryForm.value);
  
    if (this.addSundryForm.valid) {
      const selectedProduct = this.products.find(
        p => p.product_Code === this.addSundryForm.get('productCode')?.value
      );
  
      if (!selectedProduct) {
        console.error('No product selected');
        alert('Please select a product from the dropdown');
        return;
      }
  
      console.log('Sundry Notes Array:', this.sundryNotes);
  
      const sundryNoteId = +this.addSundryForm.get('sundry_Note_ID')?.value; // Coerce to number
      console.log('Form Value for sundry_Note_ID:', sundryNoteId);
  
      const selectedSundryNote = this.sundryNotes.find(
        note => note.sundry_Note_ID === sundryNoteId
      );
  
      if (!selectedSundryNote) {
        console.error('No sundry note selected');
        alert('Please select a sundry note from the dropdown');
        return;
      }
  
      const sundryData: sundry = {
        sundry_Note_ID: selectedSundryNote.sundry_Note_ID,
        productID: selectedProduct.productID,
        gross_Weight: this.addSundryForm.get('gross_Weight')?.value,
        tare_Weight: this.addSundryForm.get('tare_Weight')?.value,
        net_Weight: this.addSundryForm.get('net_Weight')?.value,
        comments: this.addSundryForm.get('comments')?.value,
        sundry_Date: new Date()
      };
  
      console.log('Sending sundry data:', sundryData);
  
      this.sundryService.addSundry(sundryData).subscribe({
        next: () => {
          console.log('Sundry added successfully');
          this.loadSundryNotesForDropdown();
          this.addSundryForm.reset({
            sundry_Note_ID: null,
            gross_Weight: 0,
            tare_Weight: 0,
            net_Weight: 0
          });
        },
        error: (error) => {
          console.error('Error adding sundry note:', error);
          alert('Failed to add sundry note. Please ensure all fields are filled correctly.');
        }
      });
    } else {
      console.error('Form is invalid. Please ensure all required fields are filled.');
    }
  }
  printLabel() {
    console.log('Printing label...');
  }

  printTable() {
    window.print();
  }

  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sundry Notes');

    worksheet.columns = this.displayedColumns.map(column => ({
      header: column,
      key: column,
      width: 15
    }));

    // Map the data to include product details before adding to worksheet
    const exportData = this.sundryNotes.map(note => ({
      sundryID: note.sundryID,
      productCode: note.productID != null ? this.getProductCode(note.productID) : 'N/A',
      productName: note.productID != null ? this.getProductName(note.productID) : 'N/A',
      gross_Weight: note.gross_Weight,
      tare_Weight: note.tare_Weight,
      net_Weight: note.net_Weight,
      time: note.sundry_Date ? new Date(note.sundry_Date).toLocaleTimeString() : 'N/A',
      sundry_Date: note.sundry_Date,
      operator: this.currentOperator
    }));

    exportData.forEach(row => {
      worksheet.addRow(row);
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'sundry_notes.xlsx');
    });
  }
}
