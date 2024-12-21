import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
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
    grvservice
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
      sundry_Note_ID: [0, Validators.required]
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
        console.log('Raw GRV data:', grvs);
        this.suppliers = suppliers || [];
        this.products = products || [];
        this.sundryNotesList = sundryNotes || [];
        this.grvList = grvs || [];
        this.loadIncomings();
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

    // Sundry Notes filtering
    this.filteredSundryNotes = this.addIncomingForm.get('sundry_Note_ID')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = value?.toString().toLowerCase() || '';
        return this.sundryNotesList.filter(note => 
          note.sundry_Note!.toLowerCase().includes(filterValue) ||
          note.sundry_Note_ID!.toString().includes(filterValue)
        );
      })
    );

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

  private setupFormListeners(): void {
    // Supplier name change listener
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
          return {
            ...incoming,
            supplierName: supplier?.supplier_Name || 'Unknown',
            productName: product?.product_Name || 'Unknown'
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
      const supplier = this.suppliers.find(s => s.supplier_Name === formValue.supplierName);
      const product = this.products.find(p => p.product_Name === formValue.productName);

      const newIncoming: incoming = {
        incoming_Date: new Date(),
        gRV_ID: formValue.gRV_ID,
        supplierID: supplier?.supplierID,
        productID: product?.productID,
        gross_Weight: formValue.gross_Weight,
        tare_Weight: formValue.tare_Weight,
        net_Weight: formValue.net_Weight,
        comments: formValue.comments,
        sundry_Note_ID: formValue.sundry_Note_ID,
        employeeID: 1
      };

      this.incomingService.addIncoming(newIncoming).subscribe({
        next: () => {
          this.loadIncomings();
          this.addIncomingForm.reset();
        },
        error: (error) => console.error('Error adding incoming product:', error)
      });
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
        'GRV ID',
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
        
        tableHtml += '<tr>';
        tableHtml += `<td>${row.incoming_Date ? new Date(row.incoming_Date).toLocaleDateString() : ''}</td>`;
        tableHtml += `<td>${row.gross_Weight || ''}</td>`;
        tableHtml += `<td>${row.tare_Weight || ''}</td>`;
        tableHtml += `<td>${row.net_Weight || ''}</td>`;
        tableHtml += `<td>${row.gRV_ID || ''}</td>`;
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
    const grvId = this.addIncomingForm.get('gRV_ID')?.value || '';
    const grossWeight = this.addIncomingForm.get('gross_Weight')?.value || '0';
    const tareWeight = this.addIncomingForm.get('tare_Weight')?.value || '0';
    const netWeight = this.addIncomingForm.get('net_Weight')?.value || '0';

    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 10px; width: 300px;">
        <div style="font-size: 16px; font-weight: bold;">${productName}</div>
        <div style="margin-top: 5px;">GRV ID: ${grvId}</div>
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
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
  async exportToExcel(): Promise<void> {
    
}
}