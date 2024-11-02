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
    HttpClientModule,  // Make sure this is included
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [
    OutService,
    CustService,    // Add CustService to providers
    ProductService, // Add ProductService to providers
    HttpClient     // Add HttpClient to providers
  ],
  templateUrl: './outgoing-component.component.html',
  styleUrls: ['./outgoing-component.component.css']
})
export class OutgoingComponentComponent implements OnInit {
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
  customerNames: { [key: number]: string } = {};
  productNames: { [key: number]: string } = {};
  products: { [key: string]: { product_Name: string; product_Code: string } } = {};
  customers: { [key: string]: { customer_Name: string; customer_Code: string } } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private outgoingservice: OutService, private fb: FormBuilder, private customerService: CustService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
    this.addOutgoingForm = this.fb.group({
      del_Note: ['', Validators.required],
      customerName: ['', Validators.required],
      customerCode: ['', Validators.required],
      productName: ['', Validators.required],
      productCode: ['', Validators.required],
      gross_Weight: ['', Validators.required],
      tare_Weight: ['', Validators.required],
      net_Weight: ['', Validators.required],
    });
  
    // Ensure customer and product names are loaded before loading outgoings
    this.loadCustomerAndProductNames().subscribe(() => {
      this.loadOutgoings();
    });
  }
  
  loadCustomerAndProductNames(): Observable<any> {
    const customerRequest = this.outgoingservice.getAllCustomers();
    const productRequest = this.outgoingservice.getAllProducts();
  
    return forkJoin([customerRequest, productRequest]).pipe(
      tap(([customers, products]) => {
        console.log('Products from API:', products);
        
        this.customerNames = customers.reduce((acc: { [key: number]: string }, customer: customer) => {
          acc[customer.customerID!] = customer.customer_Name || 'Unknown';
          return acc;
        }, {});

        // Debug log each product as it's being processed
        products.forEach((product: Product) => {
          console.log('Processing product:', product);
          console.log('Product ID:', product.productID);
          console.log('Product Name:', product.product_Name);
        });

        // Modified product names mapping with explicit Product type
        this.productNames = products.reduce((acc: { [key: number]: string }, product: Product) => {
          if (product.productID !== undefined) {
            acc[product.productID] = product.product_Name || 'Unknown';
            console.log(`Adding product ${product.productID}: ${product.product_Name}`);
          }
          return acc;
        }, {} as { [key: number]: string });

        console.log('Final Product Names Map:', this.productNames);
      }),
      catchError((error) => {
        console.error('Error fetching customer or product names', error);
        return throwError(error);
      })
    );
}

loadOutgoings(): void {
  this.outgoingservice.getAllOutgoing().subscribe(
    (data: outgoing[]) => {
      const mappedData = data.map(outgoing => ({
        ...outgoing,
        customerName: this.customerNames[outgoing.customerID!] || 'Unknown',
        customerCode: this.customers[outgoing.customerID!]?.customer_Code || 'Unknown',
        productName: this.productNames[outgoing.productID!] || 'Unknown',
        productCode: this.products[outgoing.productID!]?.product_Code || 'Unknown',
      }));
      this.outgoings.data = mappedData;
      this.outgoings.paginator = this.paginator;
    },
    (error) => {
      console.error('Error fetching outgoings', error);
    }
  );
}

loadProducts(): void {
  this.productService.getAllProducts().subscribe(
    (products) => {
      products.forEach((product) => {
        this.products[product.productID] = {
          product_Name: product.product_Name,
          product_Code: product.product_Code,
        };
      });
    },
    (error) => {
      console.error('Error fetching products', error);
    }
  );
}

loadCustomers(): void {
  this.customerService.getAllCustomers().subscribe(
    (customers) => {
      customers.forEach((customer) => {
        if (customer.customerID !== undefined) {  // Ensure customerID is defined
          this.customers[customer.customerID] = {
            customer_Name: customer.customer_Name || 'Unknown',
            customer_Code: customer.customer_Code || 'Unknown',
          };
        } else {
          console.warn('Encountered customer with undefined customerID:', customer);
        }
      });
    },
    (error) => {
      console.error('Error fetching customers', error);
    }
  );
}
  onAddSubmit(): void {
    if (this.addOutgoingForm.valid) {
      const newOutgoing: outgoing = {
        ...this.addOutgoingForm.value,
        outgoing_Date: new Date(),
      };
      this.outgoingservice.addOutgoing(newOutgoing).subscribe(
        () => {
          this.loadOutgoings();
          this.addOutgoingForm.reset();
        },
        (error) => {
          console.error('Error adding outgoing product:', error);
        }
      );
    }
  }

  deleteOutgoings(outgoingID: number): void {
    if (confirm('Are you sure you want to delete this outgoing product?')) {
      this.outgoingservice.deleteOutgoing(outgoingID).subscribe(
        () => {
          this.loadOutgoings();
        },
        (error) => {
          console.error('Error deleting outgoing product:', error);
        }
      );
    }
  }
}