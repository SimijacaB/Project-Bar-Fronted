import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderListComponent } from './order-list/order-list';
import { OrderDetailComponent } from './order-detail/order-detail';
import { OrderFormComponent } from './order-form/order-form';
import { OrderItemFormComponent } from './order-item-form/order-item-form';
import { Order } from './models';
import { OrderService } from '../../core/services/orderService/order-service';
import { ProductService } from '../../core/services/productService/product-service';



@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    OrderListComponent,
    OrderDetailComponent,
    OrderFormComponent,
    OrderItemFormComponent
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: Order[] = [];
  loading = false;
  selectedOrder: Order | null = null;

  // Estados de los modales
  showOrderDetails = false;
  showNewOrderModal = false;
  showAddItemModal = false;

  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error al cargar las órdenes', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Eventos del componente order-list
  onViewOrderDetails(order: Order) {
    this.orderService.getOrderById(order.id).subscribe({
      next: (orderData) => {
        this.selectedOrder = orderData;
        this.showOrderDetails = true;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.snackBar.open('Error al cargar los detalles de la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onChangeOrderStatus(event: { orderId: number, newStatus: string }) {
    this.orderService.changeOrderStatus(event.orderId, event.newStatus).subscribe({
      next: () => {
        this.snackBar.open('Estado de la orden actualizado', 'Cerrar', { duration: 3000 });
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.snackBar.open('Error al actualizar el estado de la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onDeleteOrder(orderId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          this.snackBar.open('Orden eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.snackBar.open('Error al eliminar la orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onRefreshOrders() {
    this.loadOrders();
  }

  // Eventos del componente order-detail
  onCloseOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  onRefreshSelectedOrder(orderId: number) {
    this.orderService.getOrderById(orderId).subscribe({
      next: (orderData) => {
        this.selectedOrder = orderData;
        this.loadOrders(); // También actualizar la lista principal
      },
      error: (error) => {
        console.error('Error refreshing order:', error);
        this.snackBar.open('Error al actualizar la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onAddItemToOrder(orderId: number) {
    this.showAddItemModal = true;
  }

  onRemoveItemFromOrder(event: { orderId: number, itemId: number, quantity: number }) {
    this.orderService.removeOrderItemFromOrder(event.orderId, event.itemId, event.quantity).subscribe({
      next: () => {
        this.snackBar.open('Item eliminado de la orden', 'Cerrar', { duration: 3000 });
        this.onRefreshSelectedOrder(event.orderId);
      },
      error: (error) => {
        console.error('Error removing item from order:', error);
        this.snackBar.open('Error al eliminar el item de la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Eventos del componente order-form
  onOpenNewOrderModal() {
    this.showNewOrderModal = true;
  }

  onCloseNewOrderModal() {
    this.showNewOrderModal = false;
  }

  onCreateOrder(orderData: any) {
    this.orderService.saveOrder(orderData).subscribe({
      next: (response) => {
        this.snackBar.open('Orden creada exitosamente', 'Cerrar', { duration: 3000 });
        this.onCloseNewOrderModal();
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.snackBar.open('Error al crear la orden', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Eventos del componente order-item-form
  onCloseAddItemModal() {
    this.showAddItemModal = false;
  }

  onAddItemToOrderSubmit(itemData: any) {
    if (this.selectedOrder) {
      this.orderService.addOrderItemToOrder(this.selectedOrder.id, itemData).subscribe({
        next: () => {
          this.snackBar.open('Producto agregado a la orden', 'Cerrar', { duration: 3000 });
          this.onCloseAddItemModal();
          this.onRefreshSelectedOrder(this.selectedOrder!.id);
        },
        error: (error) => {
          console.error('Error adding item to order:', error);
          this.snackBar.open('Error al agregar el producto a la orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
