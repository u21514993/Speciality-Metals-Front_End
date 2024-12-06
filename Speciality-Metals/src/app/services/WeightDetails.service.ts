import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeightDetails } from '../shared/WeightDetails';

@Injectable({
  providedIn: 'root',
})
export class WeightDetailsService {
  private incomingUrl = 'https://localhost:7218/api/AllDeliveriesWeighed'; // Adjust URL as needed
  private outgoingUrl = 'https://localhost:7218/api/AllOutgoingWeight_'; // Adjust URL as needed

  constructor(private http: HttpClient) {}

  getIncomingWeightDetails(): Observable<WeightDetails[]> {
    return this.http.get<WeightDetails[]>(this.incomingUrl);
  }

  getOutgoingWeightDetails(): Observable<WeightDetails[]> {
    return this.http.get<WeightDetails[]>(this.outgoingUrl);
  }
}
