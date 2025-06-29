import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/productService/product-service';

interface ProductDto {
  name: string;
  price: number;
}

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: ProductDto[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getAllProducts().subscribe(data => {
      this.products = data;
    });
  }
}
