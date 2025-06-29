import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/product`;
  }

  saveProduct(productRequestDto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, productRequestDto);
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
