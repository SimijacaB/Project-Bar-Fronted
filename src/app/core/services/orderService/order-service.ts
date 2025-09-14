import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/order`;
  }

  saveOrder(orderRequestDTO: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, orderRequestDTO);
  }


  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/find-by-id/${id}`);
  }
  getOrderByTable(numberTable: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/find-by-table-number/${numberTable}`);
  }

  getOrderByTableToday(numberTable: number): Observable<any> {
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    return this.http.get<any>(`${this.apiUrl}/find-by-table-number/${numberTable}?date=${today}`);
  }

  updateOrder(updateOrderDTO: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, updateOrderDTO);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }

  addOrderItemToOrder(id: number, orderItemRequestDto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/add-order-item/${id}`, orderItemRequestDto);
  }

  removeOrderItemFromOrder(idOrder: number, idOrderItem: number, quantityToRemove: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/remove-order-item/${idOrder}/${idOrderItem}/${quantityToRemove}`, {});
  }

  changeOrderStatus(idOrder: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-status/${idOrder}/${status}`, {});
  }
}
