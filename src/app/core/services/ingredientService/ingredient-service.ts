import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/ingredient`;
    console.log('IngredientService initialized with URL:', this.apiUrl);
  }


  saveIngredient(ingredientRequestDto: any): Observable<any> {
    console.log('Saving ingredient:', ingredientRequestDto);
    return this.http.post<any>(`${this.apiUrl}/save`, ingredientRequestDto);
  }

  updateIngredient(ingredientRequestDto: any): Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/update`, ingredientRequestDto);
  }

  getAllIngredients(): Observable<any[]> {
    console.log('Getting all ingredients from:', `${this.apiUrl}/all`);
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  getIngredientById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getIngredientByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/code/${code}`);
  }
  deleteIngredient(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${code}`);
  }

}



