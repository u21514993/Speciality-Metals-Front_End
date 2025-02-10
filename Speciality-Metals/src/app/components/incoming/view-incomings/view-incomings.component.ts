import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { tap, catchError, throwError, forkJoin } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { map, startWith } from 'rxjs/operators';
import { IncomingService } from '../../../services/incoming.service';
import { incoming } from '../../../shared/incoming';
import { Supplier } from '../../../shared/supplier';
import { Product } from '../../../shared/Product';
import { ProductService } from '../../../services/product.service';
import { SupplierService } from '../../../services/supplier.service';
import { sundryservice } from '../../../services/sundry.service';
import { GRV } from '../../../shared/grv';
import { grvservice } from '../../../services/grv.service';
import { Sundry_Note } from '../../../shared/sundry_note';
import { AuthService } from '../../../services/auth.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';



@Component({
  selector: 'app-view-incomings',
  standalone: true,
  templateUrl: './view-incomings.component.html',
  styleUrls: ['./view-incomings.component.css'],
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
  providers: [
    IncomingService,
    SupplierService,
    ProductService,
    HttpClient,
    sundryservice,
    grvservice,
    AuthService
  ],
})
export class ViewIncomingsComponent implements OnInit {
  
  filteredGRVs!: Observable<GRV[]>;
  filteredSundryNotes!: Observable<any[]>;
  grvList: GRV[] = []; // This should be populated with your GRV data
  sundryNotesList: any[] = [];
  protected readonly Array = Array;
  addIncomingForm!: FormGroup;
  incomings = new MatTableDataSource<incoming>([]);
  displayedColumns: string[] = [
    'incomingID',
    'incoming_Date',
    'gross_Weight',
    'tare_Weight',
    'net_Weight',
    'gRV_ID',
    'supplierName',
    'productName',
    'comments',
    'sundry_Note_ID',
    'actions',
  ];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  filteredSupplierCodes!: Observable<Supplier[]>;
  filteredProductCodes!: Observable<Product[]>;
  
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private incomingService: IncomingService,
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private productService: ProductService,
    private grvService: grvservice,
    private sundryService: sundryservice,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllData();
    this.setupFormListeners();
    this.setupFilteredObservables(); // Make sure this exists
    this.setupGRVFilter(); // Add this line
  }

  ngAfterViewInit() {
    this.incomings.paginator = this.paginator;
  }

  

  private initializeForm(): void {
    this.addIncomingForm = this.fb.group({
      gRV_ID: [''],
      supplierName: ['', Validators.required],
      supplierCode: ['', Validators.required],
      productName: ['', Validators.required],
      productCode: ['', Validators.required],
      gross_Weight: [0, [Validators.required, Validators.min(0)]],
      tare_Weight: [0, [Validators.required, Validators.min(0)]],
      net_Weight: [{ value: 0, disabled: true }],
      comments: [''],
      sundry_Note_ID: [null, Validators.required] // Changed to null initial value
    });
  }
  private loadAllData(): void {
    forkJoin({
      suppliers: this.supplierService.getAllSuppliers(),
      products: this.productService.getAllProducts(),
      sundryNotes: this.sundryService.getSundryNotes(),
      grvs: this.grvService.getAllGRV()
    }).subscribe({
      next: ({ suppliers, products, sundryNotes, grvs }) => {
        this.suppliers = suppliers || [];
        this.products = products || [];
        this.sundryNotesList = sundryNotes || [];
        this.grvList = grvs || [];
        this.loadIncomings();
        this.filteredSundryNotes = of(this.sundryNotesList);
        console.log('Loaded sundry notes:', this.sundryNotesList);
      },
      error: (error) => console.error('Error loading data:', error)
    });
  }

  private setupGRVFilter(): void {
    this.filteredGRVs = this.addIncomingForm.get('gRV_ID')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!this.grvList) return [];
        
        const filterValue = (value || '').toString().toLowerCase();
        return this.grvList.filter(grv => {
          if (!grv) return false;
          return grv.grv?.toString().toLowerCase().includes(filterValue) || 
                 grv.grV_ID?.toString().includes(filterValue);
        });
      })
    );
  }

  displayGRV(grv: any): string {
    return grv ? grv.grv : '';
  }
  private setupFilteredObservables(): void {
    this.filteredSundryNotes = this.addIncomingForm.get('sundry_Note_ID')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this.filterSundryNotes(value);
        } else if (value && value.sundry_Note_ID) {
          return [value];
        } else {
          return this.sundryNotesList; // Default list if no input
        }
      })
    );
  
    // Update the form control when a sundry note is selected
    this.addIncomingForm.get('sundry_Note_ID')?.valueChanges.subscribe(selectedNote => {
      if (selectedNote && typeof selectedNote === 'object') {
        this.addIncomingForm.patchValue({
          sundry_Note_ID: selectedNote // Set the entire object
        }, { emitEvent: false });
      }
    });
    // Existing supplier and product filtering...
    this.filteredSupplierCodes = this.addIncomingForm.get('supplierCode')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = value?.toLowerCase() || '';
        return this.suppliers.filter(supplier => 
          supplier.supplier_Code?.toLowerCase().includes(filterValue)
        );
      })
    );

    this.filteredProductCodes = this.addIncomingForm.get('productCode')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = value?.toLowerCase() || '';
        return this.products.filter(product => 
          product.product_Code?.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  private filterSundryNotes(value: string): Sundry_Note[] {
    const filterValue = value.toLowerCase();
    return this.sundryNotesList.filter(note => {
      const sundryNoteStr = note.sundry_Note?.toLowerCase() || '';
      const sundryNoteIdStr = note.sundry_Note_ID?.toString().toLowerCase() || '';
      return sundryNoteStr.includes(filterValue) || sundryNoteIdStr.includes(filterValue);
    });
  }
  displaySundryNote(note: any): string {
    if (!note) return '';
    return note.sundry_Note || ''; // Ensure this returns the correct display value
  }
  private setupFormListeners(): void {
    this.addIncomingForm.get('sundry_Note_ID')?.valueChanges.subscribe(selectedNote => {
      console.log('Sundry Note Changed:', selectedNote);
      if (selectedNote && typeof selectedNote === 'object') {
        // Store the entire object to preserve the ID
        this.addIncomingForm.patchValue({
          sundry_Note_ID: selectedNote
        }, { emitEvent: false });
      }
    });
  
  

    // Supplier code change listener
    this.addIncomingForm.get('supplierName')?.valueChanges.subscribe(value => {
      if (value) {
        const supplier = this.suppliers.find(s => s.supplier_Name === value);
        if (supplier && supplier.supplier_Code) {
          this.addIncomingForm.patchValue({
            supplierCode: supplier.supplier_Code
          }, { emitEvent: false });
        }
      }
    });
  
    // Supplier code change listener
    this.addIncomingForm.get('supplierCode')?.valueChanges.subscribe(value => {
      if (value) {
        const supplier = this.suppliers.find(s => s.supplier_Code === value);
        if (supplier && supplier.supplier_Name) {
          this.addIncomingForm.patchValue({
            supplierName: supplier.supplier_Name
          }, { emitEvent: false });
        }
      }
    });

    // Product name change listener
    this.addIncomingForm.get('productName')?.valueChanges.subscribe(value => {
      if (value) {
        const product = this.products.find(p => p.product_Name === value);
        if (product && product.product_Code) {
          this.addIncomingForm.patchValue({
            productCode: product.product_Code
          }, { emitEvent: false });
        }
      }
    });

    // Product code change listener
    this.addIncomingForm.get('productCode')?.valueChanges.subscribe(value => {
      if (value) {
        const product = this.products.find(p => p.product_Code === value);
        if (product && product.product_Name) {
          this.addIncomingForm.patchValue({
            productName: product.product_Name
          }, { emitEvent: false });
        }
      }
    });

    // Weight calculation listeners
    const calculateNetWeight = () => {
      const grossWeight = this.addIncomingForm.get('gross_Weight')?.value || 0;
      const tareWeight = this.addIncomingForm.get('tare_Weight')?.value || 0;
      const netWeight = Math.max(0, grossWeight - tareWeight);
      this.addIncomingForm.patchValue({
        net_Weight: netWeight
      }, { emitEvent: false });
    };

    this.addIncomingForm.get('gross_Weight')?.valueChanges.subscribe(() => calculateNetWeight());
    this.addIncomingForm.get('tare_Weight')?.valueChanges.subscribe(() => calculateNetWeight());
  }



  loadIncomings(): void {
    this.incomingService.getIncomings().subscribe({
      next: (data: incoming[]) => {
        const mappedData = data.map(incoming => {
          const supplier = this.suppliers.find(s => s.supplierID === incoming.supplierID);
          const product = this.products.find(p => p.productID === incoming.productID);
          const grv = this.grvList.find(g => g.grV_ID?.toString() === incoming.grV_ID?.toString());
          const sundryNote = this.sundryNotesList.find(
            note => note.sundry_Notes_ID?.toString() === incoming.sundry_Note_ID?.toString()
          );
  
          return {
            ...incoming,
            supplierName: supplier?.supplier_Name || 'Unknown',
            productName: product?.product_Name || 'Unknown',
            grvNumber: grv?.grv || 'Unknown',
            sundryNoteNumber: sundryNote?.sundry_Note || 'Unknown' // Change this line
          };
        });
        this.incomings.data = mappedData;
        this.incomings.paginator = this.paginator;
      },
      error: (error) => console.error('Error fetching incomings:', error)
    });
  }

  onAddSubmit(): void {
    if (this.addIncomingForm.valid) {
      const formValue = this.addIncomingForm.getRawValue();
      console.log('Raw Form Value:', formValue);
  
      // Get current user
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?.staffID) {
        console.error('No logged in user found');
        return;
      }
  
      // Find supplier and product IDs
      const supplier = this.suppliers.find(s => s.supplier_Name === formValue.supplierName);
      const product = this.products.find(p => p.product_Name === formValue.productName);
  
      // Handle sundry note ID
      let sundryNoteId: number;
      if (formValue.sundry_Note_ID) {
        if (typeof formValue.sundry_Note_ID === 'object') {
          // If it's an object, get the ID from sundry_Notes_ID
          sundryNoteId = formValue.sundry_Note_ID.sundry_Notes_ID;
        } else {
          // If it's already a number, use it directly
          sundryNoteId = parseInt(formValue.sundry_Note_ID);
        }
      } else {
        console.error('No sundry note ID found');
        return;
      }
  
      // Handle GRV ID
      let grvId: number;
      if (formValue.gRV_ID) {
        if (typeof formValue.gRV_ID === 'object') {
          grvId = formValue.gRV_ID.grV_ID;
        } else {
          grvId = parseInt(formValue.gRV_ID);
        }
      } else {
        console.error('No GRV ID found');
        return;
      }
  
      const newIncoming: incoming = {
        incomingID: 0,
        incoming_Date: new Date(),
        gross_Weight: parseFloat(formValue.gross_Weight),
        tare_Weight: parseFloat(formValue.tare_Weight),
        net_Weight: parseFloat(formValue.net_Weight),
        supplierID: supplier?.supplierID || 0,
        productID: product?.productID || 0,
        employeeID: currentUser.staffID,
        grV_ID: grvId,
        comments: formValue.comments || '',
        sundry_Note_ID: sundryNoteId // Now correctly set
      };
  
      console.log('Sending to API:', newIncoming);
  
      this.incomingService.addIncoming(newIncoming).subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.loadIncomings();
          this.addIncomingForm.reset();
        },
        error: (error) => {
          console.error('Error details:', error);
          if (error.error && error.error.message) {
            alert(`Failed to add incoming record: ${error.error.message}`);
          } else {
            alert('Failed to add incoming record. Please check the console for details.');
          }
        }
      });
    } else {
      Object.keys(this.addIncomingForm.controls).forEach(key => {
        const control = this.addIncomingForm.get(key);
        if (control?.errors) {
          console.error(`Validation error in ${key}:`, control.errors);
        }
      });
      alert('Please fill in all required fields correctly.');
    }
  }
  deleteIncoming(incomingID: number): void {
    if (confirm('Are you sure you want to delete this incoming product?')) {
      this.incomingService.deleteIncoming(incomingID).subscribe({
        next: () => this.loadIncomings(),
        error: (error) => console.error('Error deleting incoming product:', error)
      });
    }
  }

  printTable() {
    const printWindow = window.open('', '_blank');
    if (printWindow && this.incomings.data) {
      let tableHtml = '<table><thead><tr>';
      
      const printHeaders = [
        'Date',
  'Gross Weight',
  'Tare Weight',
  'Net Weight',
  'GRV Number',
  'Sundry Note',
  'Supplier Name',
  'Product Name'
      ];
      
      printHeaders.forEach(header => {
        tableHtml += `<th>${header}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      this.incomings.data.forEach(row => {
        const supplier = this.suppliers.find(s => s.supplierID === row.supplierID);
        const product = this.products.find(p => p.productID === row.productID);
        const grv = this.grvList.find(g => g.grV_ID === row.grV_ID);
        const sundryNote = this.sundryNotesList.find(n => n.sundry_Notes_ID === row.sundry_Note_ID);
        
        tableHtml += '<tr>';
        tableHtml += `<td>${row.incoming_Date ? new Date(row.incoming_Date).toLocaleDateString() : ''}</td>`;
        tableHtml += `<td>${row.gross_Weight || ''}</td>`;
        tableHtml += `<td>${row.tare_Weight || ''}</td>`;
        tableHtml += `<td>${row.net_Weight || ''}</td>`;
        tableHtml += `<td>${grv?.grv || ''}</td>`;
        tableHtml += `<td>${sundryNote?.sundry_Note || ''}</td>`;
        tableHtml += `<td>${supplier?.supplier_Name || ''}</td>`;
        tableHtml += `<td>${product?.product_Name || ''}</td>`;
        tableHtml += '</tr>';
      });
      
      tableHtml += '</tbody></table>';
      
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Incoming Records</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              h2 {
                color: #333;
                margin-bottom: 20px;
              }
              table { 
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td { 
                border: 1px solid #ddd;
                padding: 12px 8px;
                text-align: left;
              }
              th {
                background-color: #f4f4f4;
                font-weight: bold;
              }
              @media print {
                body { 
                  padding: 0;
                }
                table {
                  page-break-inside: auto;
                }
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
              }
            </style>
          </head>
          <body>
            <h2>Incoming Records</h2>
            ${tableHtml}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  printLabel() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
  
    const productName = this.addIncomingForm.get('productName')?.value || '';
    const sundryNote = this.addIncomingForm.get('sundry_Note_ID')?.value?.sundry_Note || ''; // Get the sundry note value
    const grossWeight = this.addIncomingForm.get('gross_Weight')?.value || '0';
    const tareWeight = this.addIncomingForm.get('tare_Weight')?.value || '0';
    const netWeight = this.addIncomingForm.get('net_Weight')?.value || '0';
  
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 10px; width: 300px;">
        <div style="font-size: 16px; font-weight: bold;">Sundry Note: ${sundryNote}</div>
        <div style="margin-top: 5px;">Gross: ${grossWeight} kg</div>
        <div style="margin-top: 5px;">Tare: ${tareWeight} kg</div>
        <div style="margin-top: 5px;">Net: ${netWeight} kg</div>
        <div style="margin-top: 10px; font-size: 12px;">${date} ${time}</div>
      </div>
    `;
  
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label</title>
            <style>
              @media print {
                @page {
                  size: 3in 2in;
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
  async exportToExcel(): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Incoming Products');

      // Define columns
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'GRV Number', key: 'grv', width: 15 },
        { header: 'Sundry Note', key: 'sundryNote', width: 15 },
        { header: 'Supplier', key: 'supplier', width: 20 },
        { header: 'Product', key: 'product', width: 20 },
        { header: 'Gross Weight', key: 'grossWeight', width: 12 },
        { header: 'Tare Weight', key: 'tareWeight', width: 12 },
        { header: 'Net Weight', key: 'netWeight', width: 12 },
        { header: 'Comments', key: 'comments', width: 30 }
      ];
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    this.incomings.data.forEach(record => {
      const supplier = this.suppliers.find(s => s.supplierID === record.supplierID);
      const product = this.products.find(p => p.productID === record.productID);
      const grv = this.grvList.find(g => g.grV_ID === record.grV_ID);
      const sundryNote = this.sundryNotesList.find(n => n.sundry_Notes_ID === record.sundry_Note_ID);
    
      worksheet.addRow({
        date: record.incoming_Date ? new Date(record.incoming_Date).toLocaleDateString() : '',
        grv: grv?.grv || '',
        sundryNote: sundryNote?.sundry_Note || '',
        supplier: supplier?.supplier_Name || '',
        product: product?.product_Name || '',
        grossWeight: record.gross_Weight,
        tareWeight: record.tare_Weight,
        netWeight: record.net_Weight,
        comments: record.comments
      });
    });


    // Style all data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 8 }
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `incoming_products_${dateStr}.xlsx`;
    
    // Save the file
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel. Please try again.');
  }
}
}