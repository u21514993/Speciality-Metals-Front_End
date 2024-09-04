import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator'; // Import MatPaginatorModule
import { MatTableDataSource } from '@angular/material/table';
import { IncomingService } from '../../../services/incoming.service'; // Update the path
import { incoming } from '../../../shared/incoming';

@Component({
  selector: 'app-view-incomings',
  standalone: true,
  templateUrl: './view-incomings.component.html',
  styleUrls: ['./view-incomings.component.css'],
  imports: [CommonModule, HttpClientModule, MatTableModule, MatPaginatorModule], // Add MatTableModule and MatPaginatorModule
  providers: [IncomingService]
})
export class ViewIncomingsComponent implements OnInit {

  // Angular Material Data Source for the Table
  incomings = new MatTableDataSource<incoming>([]);

  // Columns to be displayed in the table
  displayedColumns: string[] = ['incomingID', 'incoming_Date', 'gross_Weight', 'tare_Weight', 'net_Weight', 'gRV_Number', 'supplierID', 'productID'];

  // Paginator for the table
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private incomingService: IncomingService) { }

  ngOnInit(): void {
    this.loadIncomings();
  }

  // Fetch data from the service
  loadIncomings(): void {
    this.incomingService.getIncomings().subscribe(
      (data: incoming[]) => {
        this.incomings.data = data;
        this.incomings.paginator = this.paginator; // Attach paginator once data is loaded
      },
      error => {
        console.error('Error fetching incomings', error);
      }
    );
  }
}
