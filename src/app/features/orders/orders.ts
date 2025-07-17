import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from './models';
import { OrderService } from '../../core/services/orderService/order-service';
import { ProductService } from '../../core/services/productService/product-service';
import { OrderForm } from './order-form/order-form';
import { OrderStatus } from '../../shared/enums/order-status';
import { MatMenuModule } from '@angular/material/menu';
import { OrderDetail } from './order-detail/order-detail';


@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    OrderForm,
    MatMenuModule,
    OrderDetail,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: Order[] = [];
  loading = false;
  loadingTableOrders = false;
  selectedOrder: Order | null = null;
  tableOrders: Order[] = []; // Órdenes específicas de la mesa seleccionada

  // Estados de los modales
  showOrderDetails = false;
  showNewOrderModal = false;
  showAddItemModal = false;
  showTableOrders = false; // Para mostrar/ocultar el panel de órdenes de la mesa

  mesas = Array.from({ length: 12 }, (_, i) => i + 1); // Mesas 1 a 10
  mesaSeleccionada: number | null = null;
  hoy = new Date();

  OrderStatus = OrderStatus;

  get todayOrders() {
    // Filtrar órdenes por fecha de hoy (ignorando hora)
    return this.orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getFullYear() === this.hoy.getFullYear() &&
        orderDate.getMonth() === this.hoy.getMonth() &&
        orderDate.getDate() === this.hoy.getDate();
    });
  }

  getMesaOrders(mesa: number) {
    return this.todayOrders.filter(order => order.tableNumber === mesa);
  }

  getMesaEstado(mesa: number): 'Ocupada' | 'Disponible' {
    return this.getMesaOrders(mesa).length > 0 ? 'Ocupada' : 'Disponible';
  }

  getMesaResumen(mesa: number) {
    const ordenes = this.getMesaOrders(mesa);
    const resumen: Record<string, number> = {};
    for (const orden of ordenes) {
      resumen[orden.status] = (resumen[orden.status] || 0) + 1;
    }
    return resumen;
  }

  getOrderStatuses(): string[] {
    // Devuelve todos los estados posibles de las órdenes de hoy
    const estados = new Set<string>();
    for (const order of this.todayOrders) {
      estados.add(order.status);
    }
    return Array.from(estados);
  }

  seleccionarMesa(mesa: number) {
    this.mesaSeleccionada = mesa;
    this.cargarOrdenesDeMesa(mesa);
    this.showTableOrders = true;
  }

  deseleccionarMesa() {
    this.mesaSeleccionada = null;
    this.tableOrders = [];
    this.showTableOrders = false;
  }

  cargarOrdenesDeMesa(mesa: number) {
    this.loadingTableOrders = true;
    this.orderService.getOrderByTable(mesa).subscribe({
      next: (data) => {
        this.tableOrders = Array.isArray(data) ? data : [data];
        this.loadingTableOrders = false;
      },
      error: (error) => {
        console.error(`Error al cargar órdenes de la mesa ${mesa}:`, error);
        this.snackBar.open(`Error al cargar órdenes de la mesa ${mesa}`, 'Cerrar', { duration: 3000 });
        this.loadingTableOrders = false;
        this.tableOrders = [];
      }
    });
  }

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
    console.log('Botón Nueva Orden presionado');
    this.showNewOrderModal = true;
  }

  onCloseNewOrderModal() {
    console.log('Modal de Nueva Orden cerrado');
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

  // Manejadores para las acciones de órdenes
  handleViewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  handleChangeOrderStatus(event: { orderId: number, newStatus: OrderStatus }) {
    const { orderId, newStatus } = event;
    const orderToUpdate = this.tableOrders.find(o => o.id === orderId);

    if (orderToUpdate) {
      // Preparar el DTO para actualizar
      const updateOrderDTO = {
        id: orderId,
        status: newStatus
      };

      this.orderService.updateOrder(updateOrderDTO).subscribe({
        next: (updatedOrder) => {
          // Actualizar la orden en la lista
          const index = this.tableOrders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            this.tableOrders[index] = { ...this.tableOrders[index], status: newStatus };
          }

          // Actualizar también en la lista general de órdenes
          const generalIndex = this.orders.findIndex(o => o.id === orderId);
          if (generalIndex !== -1) {
            this.orders[generalIndex] = { ...this.orders[generalIndex], status: newStatus };
          }

          this.snackBar.open('Estado de la orden actualizado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al actualizar el estado de la orden:', error);
          this.snackBar.open('Error al actualizar el estado de la orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleDeleteOrder(orderId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          // Eliminar la orden de la lista
          this.tableOrders = this.tableOrders.filter(o => o.id !== orderId);
          this.orders = this.orders.filter(o => o.id !== orderId);
          this.snackBar.open('Orden eliminada correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al eliminar la orden:', error);
          this.snackBar.open('Error al eliminar la orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  refreshTableOrders() {
    if (this.mesaSeleccionada) {
      this.cargarOrdenesDeMesa(this.mesaSeleccionada);
    }
  }
}
