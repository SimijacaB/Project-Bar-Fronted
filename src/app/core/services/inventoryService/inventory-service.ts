import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/inventory`;
  }

 getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Save new inventory item
  save(inventoryRequestDTO: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, inventoryRequestDTO);
  }

  //Add stock to an inventory item
  addStock(quantity: number, code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-stock`, { quantity, code });
  }

// Deduct stock from an inventory item
  deductStock(quantity: number, code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deduct-stock`, { quantity, code });
  }

  // Update inventory item
  update(updateInventoryDTO: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, updateInventoryDTO);
  }

  // Delete inventory item
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }
}
