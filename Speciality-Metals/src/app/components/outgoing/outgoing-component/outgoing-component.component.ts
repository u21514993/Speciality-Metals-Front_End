import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
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
    ReactiveFormsModule,
  ],
  providers: [OutService],
  templateUrl: './outgoing-component.component.html',
  styleUrls: ['./outgoing-component.component.css'] // Corrected from styleUrl to styleUrls
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private outgoingservice: OutService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addOutgoingForm = this.fb.group({
      del_Note: ['', Validators.required],
      customerID: ['', Validators.required],
      productID: ['', Validators.required],
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
        console.log('Outgoing Data:', data); // Log outgoing data
        
        const mappedData = data.map(outgoing => ({
          ...outgoing,
          customerName: this.customerNames[outgoing.customerID!] || 'Unknown',
          productName: this.productNames[outgoing.productID!] || 'Unknown',  // Ensure productID is correct
        }));
  
        console.log('Mapped Outgoing Data:', mappedData); // Log mapped data
        this.outgoings.data = mappedData;
        this.outgoings.paginator = this.paginator;
      },
      (error) => {
        console.error('Error fetching outgoings', error);
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