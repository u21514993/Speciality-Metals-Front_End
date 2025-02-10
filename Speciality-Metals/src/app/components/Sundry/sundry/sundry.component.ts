import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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

  ngAfterViewInit() {
    this.loadSundryData();
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
  
  const currentDate = new Date();
  const sundryData = {
    sundry_Note_ID: this.addSundryForm.get('sundry_Note_ID')?.value,
    productID: this.products.find(
      p => p.product_Code === this.addSundryForm.get('productCode')?.value
    )?.productID,
    gross_Weight: this.addSundryForm.get('gross_Weight')?.value,
    tare_Weight: this.addSundryForm.get('tare_Weight')?.value,
    net_Weight: this.addSundryForm.get('net_Weight')?.value,
    comments: this.addSundryForm.get('comments')?.value,
    sundry_Date: currentDate,
    time: currentDate.toTimeString().split(' ')[0],  // This will give HH:mm:ss
    employeeID: currentUser.staffID,
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
  printLabel(event?: Event) {
    // Prevent the default action (such as form submission)
    if (event) {
      event.preventDefault();
    }
  
    // Get the current form data
    const formData = this.addSundryForm.value;
  
    // Find the selected sundry note to get its value
    const selectedSundryNote = this.sundryNotes.find(note => note.sundry_Notes_ID === formData.sundry_Note_ID);
    const sundryNoteValue = selectedSundryNote ? selectedSundryNote.sundry_Note : 'N/A';
  
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }
  
    // Create the label HTML content
    const labelContent = `
      <html>
        <head>
          <title>Sundry Label</title>
          <style>
            .label-container {
              width: 4in;
              height: 6in;
              padding: 0.5in;
              border: 1px solid #000;
              margin: 0 auto;
            }
            .label-item {
              margin-bottom: 15px;
              font-size: 14px;
            }
            .label-title {
              font-weight: bold;
              font-size: 18px;
              text-align: center;
              margin-bottom: 20px;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="label-title">Sundry Product Label</div>
            <div class="label-item">Product Name: ${formData.productName || 'N/A'}</div>
            <div class="label-item">Sundry Note: ${sundryNoteValue}</div>
            <div class="label-item">Gross Weight: ${formData.gross_Weight || 0} kg</div>
            <div class="label-item">Tare Weight: ${formData.tare_Weight || 0} kg</div>
            <div class="label-item">Net Weight: ${formData.net_Weight || 0} kg</div>
            <div class="label-item">Date: ${new Date().toLocaleDateString()}</div>
            <div class="label-item">Time: ${new Date().toLocaleTimeString()}</div>
          </div>
        </body>
      </html>`;
  
    // Write to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(labelContent);
    printWindow.document.close();
    printWindow.print();
  }
  printTable() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }

    // Get the current data from the table
    const data = this.dataSource.data;

    // Create the HTML content
    let printContent = `
      <html>
        <head>
          <title>Sundry Records</title>
          <style>
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
            }
            h1 { 
              text-align: center; 
              margin-bottom: 20px;
            }
            @media print {
              button { 
                display: none; 
              }
            }
          </style>
        </head>
        <body>
          <h1>Sundry Records</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Code</th>
                <th>Product Name</th>
                <th>Gross Weight</th>
                <th>Tare Weight</th>
                <th>Net Weight</th>
                <th>Time</th>
                <th>Date</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>`;

    // Add data rows
    data.forEach(item => {
      printContent += `
        <tr>
          <td>${item.sundryID || 'N/A'}</td>
          <td>${item.productCode || 'N/A'}</td>
          <td>${item.productName || 'N/A'}</td>
          <td>${item.gross_Weight || 0}</td>
          <td>${item.tare_Weight || 0}</td>
          <td>${item.net_Weight || 0}</td>
          <td>${item.time || 'N/A'}</td>
          <td>${new Date(item.sundry_Date).toLocaleDateString() || 'N/A'}</td>
          <td>${item.operator || 'N/A'}</td>
        </tr>`;
    });

    printContent += `
            </tbody>
          </table>
          <button onclick="window.print()">Print</button>
        </body>
      </html>`;

    // Write to the new window and trigger print
    printWindow.document.write(printContent);
    printWindow.document.close();
  }


  async exportToExcel() {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sundry Records');

      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'sundryID', width: 10 },
        { header: 'Product Code', key: 'productCode', width: 15 },
        { header: 'Product Name', key: 'productName', width: 20 },
        { header: 'Gross Weight', key: 'gross_Weight', width: 15 },
        { header: 'Tare Weight', key: 'tare_Weight', width: 15 },
        { header: 'Net Weight', key: 'net_Weight', width: 15 },
        { header: 'Time', key: 'time', width: 15 },
        { header: 'Date', key: 'sundry_Date', width: 15 },
        { header: 'Operator', key: 'operator', width: 20 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      const data = this.dataSource.data;
      data.forEach(item => {
        worksheet.addRow({
          sundryID: item.sundryID || 'N/A',
          productCode: item.productCode || 'N/A',
          productName: item.productName || 'N/A',
          gross_Weight: item.gross_Weight || 0,
          tare_Weight: item.tare_Weight || 0,
          net_Weight: item.net_Weight || 0,
          time: item.time || 'N/A',
          sundry_Date: new Date(item.sundry_Date).toLocaleDateString() || 'N/A',
          operator: item.operator || 'N/A'
        });
      });

      // Auto-fit columns with type-safe implementation
      worksheet.columns.forEach(column => {
        if (column.key) { // Check if column.key exists
          const columnLength = Math.max(
            column.header?.toString().length || 10,
            ...worksheet.getColumn(column.key as string).values
              .filter((v): v is string | number => v !== null && v !== undefined) // Type guard
              .map(v => v.toString().length)
          );
          column.width = columnLength + 2;
        }
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Save the file
      const fileName = `Sundry_Records_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  }

  private loadSundryData() {
    console.log('Loading sundry data...');
    forkJoin({
      sundries: this.sundryService.getAllSundry(),
      products: this.sundryService.getAllProducts(),
      staff: this.authService.getAllStaff()
    }).subscribe({
      next: (data) => {
        const mappedData = data.sundries.map((sundry: sundry) => {
          const product = data.products.find((p: Product) => p.productID === sundry.productID);
          const employee = data.staff.find((s: any) => s.staffID === sundry.employeeID);
          
          return {
            sundryID: sundry.sundryID,
            sundry_Date: sundry.sundry_Date,
            time: sundry.time,
            gross_Weight: sundry.gross_Weight,
            tare_Weight: sundry.tare_Weight,
            net_Weight: sundry.net_Weight,
            employeeID: sundry.employeeID,
            productID: sundry.productID,
            comments: sundry.comments,
            sundry_Note_ID: sundry.sundry_Note_ID,
            productName: product?.product_Name || 'N/A',
            productCode: product?.product_Code || 'N/A',
            operator: employee?.employee_Name || 'N/A'
          };
        });
        
        console.log('Mapped data:', mappedData);
        this.dataSource = new MatTableDataSource(mappedData);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error loading sundry data:', error);
      },
      complete: () => {
        console.log('Loading completed');
      }
    });
  }

  // Optional: Add a refresh method that can be called after adding new data
  refreshTable() {
    this.loadSundryData();
  }
}
