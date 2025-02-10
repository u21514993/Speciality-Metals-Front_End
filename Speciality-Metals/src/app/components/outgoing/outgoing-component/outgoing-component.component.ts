import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
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
import { OutService } from '../../../services/outgoing.service';
import { FormControl } from '@angular/forms';
import { outgoing } from '../../../shared/outgoing';
import { forkJoin } from 'rxjs';
import { customer } from '../../../shared/customer';
import { Product } from '../../../shared/Product';
import { ProductService } from '../../../services/product.service';
import { CustService } from '../../../services/customer.service';
import { sundryservice } from '../../../services/sundry.service';
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
  selector: 'app-outgoing-component',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    
  ],
  providers: [
    OutService,
    CustService,
    FormControl,
    ProductService,
    HttpClient,
    sundryservice,
    AuthService
  ],
  templateUrl: './outgoing-component.component.html',
  styleUrls: ['./outgoing-component.component.css']
})
export class OutgoingComponentComponent implements OnInit {
  protected readonly Array = Array;
  addOutgoingForm!: FormGroup;
  outgoings = new MatTableDataSource<outgoing>([]);
  displayedColumns: string[] = [
    'sundry_Note',
    'outgoing_Date',
    'gross_Weight',
    'tare_Weight',
    'net_Weight',
    'customerName',
    'productName',
    'actions',
  ]

  customers: customer[] = [];
  products: Product[] = [];
  sundryNotes: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.outgoings.paginator = this.paginator;
  }

  constructor(
    private outgoingservice: OutService,
    private fb: FormBuilder,
    private customerService: CustService,
    private productService: ProductService,
    private sundryService: sundryservice,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllData();
    this.setupFormListeners();
    this.addOutgoingForm.get('sundry_Note')?.valueChanges.subscribe(value => {
      console.log('Selected sundry note ID:', value);
      const selectedNote = this.sundryNotes.find(note => note.sundry_Notes_ID === value);
      console.log('Selected sundry note:', selectedNote);
    });
  }

  private initializeForm(): void {
    this.addOutgoingForm = this.fb.group({
      sundry_Note: ['', Validators.required], // Ensure this matches the form control name
      customerName: ['', Validators.required],
      customerCode: ['', Validators.required],
      productName: ['', Validators.required],
      productCode: ['', Validators.required],
      gross_Weight: [0, [Validators.required, Validators.min(0)]],
      tare_Weight: [0, [Validators.required, Validators.min(0)]],
      net_Weight: [{ value: 0, disabled: true }],
    });
  }

  private loadAllData(): void {
    forkJoin({
      customers: this.customerService.getAllCustomers(),
      products: this.productService.getAllProducts(),
      sundryNotes: this.sundryService.getSundryNotes()
    }).subscribe({
      next: ({ customers, products, sundryNotes }) => {
        console.log('Sundry Notes:', sundryNotes); // Add this line
        this.customers = customers;
        this.products = products;
        this.sundryNotes = sundryNotes;
        this.loadOutgoings();
      },
      error: (error) => console.error('Error loading data:', error)
    });
  }


  private setupFormListeners(): void {
    // Customer name change listener
    this.addOutgoingForm.get('customerName')?.valueChanges.subscribe(value => {
      if (value) {
        const customer = this.customers.find(c => c.customer_Name === value);
        if (customer && customer.customer_Code) {
          this.addOutgoingForm.patchValue({
            customerCode: customer.customer_Code
          }, { emitEvent: false });
        }
      }
    });

    // Customer code change listener
    this.addOutgoingForm.get('customerCode')?.valueChanges.subscribe(value => {
      if (value) {
        const customer = this.customers.find(c => c.customer_Code === value);
        if (customer && customer.customer_Name) {
          this.addOutgoingForm.patchValue({
            customerName: customer.customer_Name
          }, { emitEvent: false });
        }
      }
    });

    // Product name change listener
    this.addOutgoingForm.get('productName')?.valueChanges.subscribe(value => {
      if (value) {
        const product = this.products.find(p => p.product_Name === value);
        if (product && product.product_Code) {
          this.addOutgoingForm.patchValue({
            productCode: product.product_Code
          }, { emitEvent: false });
        }
      }
    });

    // Product code change listener
    this.addOutgoingForm.get('productCode')?.valueChanges.subscribe(value => {
      if (value) {
        const product = this.products.find(p => p.product_Code === value);
        if (product && product.product_Name) {
          this.addOutgoingForm.patchValue({
            productName: product.product_Name
          }, { emitEvent: false });
        }
      }
    });

    // Weight calculation listeners
    const calculateNetWeight = () => {
      const grossWeight = this.addOutgoingForm.get('gross_Weight')?.value || 0;
      const tareWeight = this.addOutgoingForm.get('tare_Weight')?.value || 0;
      const netWeight = Math.max(0, grossWeight - tareWeight);
      this.addOutgoingForm.patchValue({
        net_Weight: netWeight
      }, { emitEvent: false });
    };

    this.addOutgoingForm.get('gross_Weight')?.valueChanges.subscribe(() => calculateNetWeight());
    this.addOutgoingForm.get('tare_Weight')?.valueChanges.subscribe(() => calculateNetWeight());
  }

  loadOutgoings(): void {
    this.outgoingservice.getAllOutgoing().subscribe({
      next: (data: outgoing[]) => {
        const mappedData = data.map(outgoing => {
          const customer = this.customers.find(c => c.customerID === outgoing.customerID);
          const product = this.products.find(p => p.productID === outgoing.productID);
          const sundryNote = this.sundryNotes.find(note => note.sundry_Notes_ID === outgoing.sundry_Note_ID); // Get the sundry note
  
          return {
            ...outgoing,
            customerName: customer?.customer_Name || 'Unknown',
            productName: product?.product_Name || 'Unknown',
            sundry_Note: sundryNote?.sundry_Note || 'Unknown' // Map the sundry note value
          };
        });
        this.outgoings.data = mappedData;
        this.outgoings.paginator = this.paginator;
      },
      error: (error) => console.error('Error fetching outgoings:', error)
    });
  }

  editoutgoings(): void{

  }

  onAddSubmit(): void {
    if (this.addOutgoingForm.valid) {
      const formValue = this.addOutgoingForm.getRawValue();
      const customer = this.customers.find(c => c.customer_Name === formValue.customerName);
      const product = this.products.find(p => p.product_Name === formValue.productName);
      const currentUser  = this.authService.getCurrentUser (); // Get the logged-in user
  
      const newOutgoing: outgoing = {
        outgoing_Date: new Date(),
        sundry_Note_ID: formValue.sundry_Note, // Use the selected sundry note ID
        customerID: customer?.customerID,
        productID: product?.productID,
        gross_Weight: formValue.gross_Weight,
        tare_Weight: formValue.tare_Weight,
        net_Weight: formValue.net_Weight,
        employeeID: currentUser ?.staffID // Assuming the Staff object has an 'id' property
      };
  
      this.outgoingservice.addOutgoing(newOutgoing).subscribe({
        next: () => {
          this.loadOutgoings();
          this.addOutgoingForm.reset();
        },
        error: (error) => console.error('Error adding outgoing product:', error)
      });
    }
  }

  deleteOutgoings(outgoingID: number): void {
    if (confirm('Are you sure you want to delete this outgoing product?')) {
      this.outgoingservice.deleteOutgoing(outgoingID).subscribe({
        next: () => this.loadOutgoings(),
        error: (error) => console.error('Error deleting outgoing product:', error)
      });
    }
  }

  printTable() {
    const printWindow = window.open('', '_blank');
    if (printWindow && this.outgoings.data) {
      let tableHtml = '<table><thead><tr>';
      
      // Add only the headers we want
      const printHeaders = [
        'Date',
        'Gross Weight',
        'Tare Weight',
        'Net Weight',
        'Del Note',
        'Customer Name',
        'Product Name',
        'Sundry Note'  // Added new header
      ];
      
      // Create headers
      printHeaders.forEach(header => {
        tableHtml += `<th>${header}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      // Add data rows
      this.outgoings.data.forEach(row => {
        // Find customer, product, and sundry note
        const customer = this.customers.find(c => c.customerID === row.customerID);
        const product = this.products.find(p => p.productID === row.productID);
        const sundryNote = this.sundryNotes.find(note => note.sundry_Notes_ID === row.sundry_Note_ID);
        
        tableHtml += '<tr>';
        // Format date with null check
        tableHtml += `<td>${row.outgoing_Date ? new Date(row.outgoing_Date).toLocaleDateString() : ''}</td>`;
        tableHtml += `<td>${row.gross_Weight || ''}</td>`;
        tableHtml += `<td>${row.tare_Weight || ''}</td>`;
        tableHtml += `<td>${row.net_Weight || ''}</td>`;
        tableHtml += `<td>${row.sundry_Note_ID || ''}</td>`;
        tableHtml += `<td>${customer?.customer_Name || ''}</td>`;
        tableHtml += `<td>${product?.product_Name || ''}</td>`;
        tableHtml += `<td>${sundryNote?.sundry_Note || ''}</td>`; // Added sundry note value
        tableHtml += '</tr>';
      });
      
      tableHtml += '</tbody></table>';
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Outgoing Records</title>
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
            <h2>Outgoing Records</h2>
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

  printLabel(event?: Event) {
    // Prevent any form submission
    if (event) {
      event.preventDefault();
    }
  
    // Get current date and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
  
    // Create a snapshot of form values without triggering form submission
    const formSnapshot = {
      productName: this.addOutgoingForm.get('productName')?.value || '',
      sundryNoteId: this.addOutgoingForm.get('sundry_Note')?.value || '',
      grossWeight: this.addOutgoingForm.get('gross_Weight')?.value || '0',
      tareWeight: this.addOutgoingForm.get('tare_Weight')?.value || '0',
      netWeight: this.addOutgoingForm.get('net_Weight')?.value || '0'
    };
  
    const sundryNote = this.sundryNotes.find(
      note => note.sundry_Notes_ID === formSnapshot.sundryNoteId
    )?.sundry_Note || 'Unknown';
  
    // Create the content for the label
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 10px; width: 300px;">
        <div style="font-size: 16px; font-weight: bold;">${formSnapshot.productName}</div>
        <div style="margin-top: 5px;">Sundry Note: ${sundryNote}</div>
        <div style="margin-top: 5px;">Gross: ${formSnapshot.grossWeight} kg</div>
        <div style="margin-top: 5px;">Tare: ${formSnapshot.tareWeight} kg</div>
        <div style="margin-top: 5px;">Net: ${formSnapshot.netWeight} kg</div>
        <div style="margin-top: 10px; font-size: 12px;">${date} ${time}</div>
      </div>
    `;
  
    // Create a new window for printing
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
              // Disable any form-related events
              window.onsubmit = function(e) {
                e.preventDefault();
                return false;
              };
              
              window.onload = function() {
                window.print();
                // Use a simple close without any callbacks
                window.onafterprint = function() {
                  window.close();
                };
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  async exportToExcel(): Promise<void> {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Outgoing Products');
  
    // Define columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Customer Name', key: 'customerName', width: 30 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Gross Weight', key: 'grossWeight', width: 15 },
      { header: 'Tare Weight', key: 'tareWeight', width: 15 },
      { header: 'Net Weight', key: 'netWeight', width: 15 },
      { header: 'Sundry Note', key: 'sundryNote', width: 30 }  // Added new column
    ];
  
    // Get visible rows from the paginator
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    const visibleRows = this.outgoings.filteredData.slice(startIndex, endIndex);
  
    // Map rows to match the worksheet structure
    const rows = visibleRows.map(row => {
      const customer = this.customers.find(c => c.customerID === row.customerID);
      const product = this.products.find(p => p.productID === row.productID);
      const sundryNote = this.sundryNotes.find(note => note.sundry_Notes_ID === row.sundry_Note_ID);
  
      return {
        date: row.outgoing_Date ? new Date(row.outgoing_Date) : null,
        customerName: customer?.customer_Name || '',
        productName: product?.product_Name || '',
        grossWeight: row.gross_Weight || 0,
        tareWeight: row.tare_Weight || 0,
        netWeight: row.net_Weight || 0,
        sundryNote: sundryNote?.sundry_Note || ''  // Added sundry note value
      };
    });
  
    worksheet.addRows(rows);
  
    // Style the header row cells
    const headerRow = worksheet.getRow(1);
    worksheet.columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  
    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const dateCell = row.getCell(1);
        if (dateCell.value) {
          dateCell.numFmt = 'dd/mm/yyyy';
        }
  
        [5, 6, 7].forEach(colIndex => {
          const cell = row.getCell(colIndex);
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right' };
        });
      }
  
      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  
    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Outgoing_Products_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}