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

 

  // Save new inventory item
  save(inventoryRequestDTO: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, inventoryRequestDTO);
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
