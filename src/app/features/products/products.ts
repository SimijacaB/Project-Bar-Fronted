import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../core/services/productService/product-service';

interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
}

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: ProductDto[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'category', 'status', 'actions'];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onRefresh() {
    this.loadProducts();
  }

  onAddProduct() {
    // TODO: Implementar lógica para agregar producto
    console.log('Add product clicked');
  }

  onEdit(product: ProductDto) {
    // TODO: Implementar lógica para editar producto
    console.log('Edit product:', product);
  }

  onDelete(productId: number) {
    // TODO: Implementar lógica para eliminar producto
    console.log('Delete product:', productId);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }
}
