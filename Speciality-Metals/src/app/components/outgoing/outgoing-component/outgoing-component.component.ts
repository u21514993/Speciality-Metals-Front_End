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
import { OutService } from '../../../services/outgoing.service';
import { outgoing } from '../../../shared/outgoing';
import { forkJoin } from 'rxjs';
import { customer } from '../../../shared/customer';
import { Product } from '../../../shared/Product';
import { ProductService } from '../../../services/product.service';
import { CustService } from '../../../services/customer.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-outgoing-component',
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
  ],
  providers: [
    OutService,
    CustService,
    ProductService,
    HttpClient
  ],
  templateUrl: './outgoing-component.component.html',
  styleUrls: ['./outgoing-component.component.css']
})
export class OutgoingComponentComponent implements OnInit {
  protected readonly Array = Array;
  addOutgoingForm!: FormGroup;
  outgoings = new MatTableDataSource<outgoing>([]);
  displayedColumns: string[] = [
    'outgoingID',
    'outgoing_Date',
    'gross_Weight',
    'tare_Weight',
    'net_Weight',
    'del_Note',
    'customerName',
    'productName',
    'actions',
  ];

  customers: customer[] = [];
  products: Product[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private outgoingservice: OutService,
    private fb: FormBuilder,
    private customerService: CustService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllData();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    this.addOutgoingForm = this.fb.group({
      del_Note: ['', Validators.required],
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
    }).subscribe({
      next: ({ customers, products }) => {
        this.customers = customers;
        this.products = products;
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
          return {
            ...outgoing,
            customerName: customer?.customer_Name || 'Unknown',
            productName: product?.product_Name || 'Unknown'
          };
        });
        this.outgoings.data = mappedData;
        this.outgoings.paginator = this.paginator;
      },
      error: (error) => console.error('Error fetching outgoings:', error)
    });
  }

  onAddSubmit(): void {
    if (this.addOutgoingForm.valid) {
      const formValue = this.addOutgoingForm.getRawValue();
      const customer = this.customers.find(c => c.customer_Name === formValue.customerName);
      const product = this.products.find(p => p.product_Name === formValue.productName);
      
      const newOutgoing: outgoing = {
        outgoing_Date: new Date(),
        del_Note: formValue.del_Note,
        customerID: customer?.customerID,
        productID: product?.productID,
        gross_Weight: formValue.gross_Weight,
        tare_Weight: formValue.tare_Weight,
        net_Weight: formValue.net_Weight
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
        'Product Name'
      ];
      
      // Create headers
      printHeaders.forEach(header => {
        tableHtml += `<th>${header}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      // Add data rows
      this.outgoings.data.forEach(row => {
        // Find customer and product names
        const customer = this.customers.find(c => c.customerID === row.customerID);
        const product = this.products.find(p => p.productID === row.productID);
        
        tableHtml += '<tr>';
        // Format date with null check
        tableHtml += `<td>${row.outgoing_Date ? new Date(row.outgoing_Date).toLocaleDateString() : ''}</td>`;
        tableHtml += `<td>${row.gross_Weight || ''}</td>`;
        tableHtml += `<td>${row.tare_Weight || ''}</td>`;
        tableHtml += `<td>${row.net_Weight || ''}</td>`;
        tableHtml += `<td>${row.del_Note || ''}</td>`;
        tableHtml += `<td>${customer?.customer_Name || ''}</td>`;
        tableHtml += `<td>${product?.product_Name || ''}</td>`;
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
}