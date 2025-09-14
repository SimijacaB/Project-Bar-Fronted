import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from './models';
import { OrderService } from '../../core/services/orderService/order-service';
import { ProductService } from '../../core/services/productService/product-service';
import { InventoryService } from '../../core/services/inventoryService/inventory-service';
import { OrderStatus } from '../../shared/enums/order-status';
import { MatMenuModule } from '@angular/material/menu';
import { OrderForm } from './order-form/order-form';
import { OrderDetail } from './order-detail/order-detail';
import { OrderItemForm } from './order-item-form/order-item-form';


@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    OrderForm,
    OrderDetail,
    OrderItemForm,
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
    this.orderService.getOrderByTableToday(mesa).subscribe({
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
    private readonly inventoryService: InventoryService,
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

  onCloseAddItemModal() {
    this.showAddItemModal = false;
  }

  onAddItemToSelectedOrder(itemData: any) {
    if (this.selectedOrder) {
      console.log('📦 Agregando item a la orden:', itemData);
      console.log('📦 Datos completos del item:', JSON.stringify(itemData, null, 2));

      // Primero agregamos el item a la orden
      this.orderService.addOrderItemToOrder(this.selectedOrder.id, itemData).subscribe({
        next: () => {
          console.log('✅ Item agregado a la orden exitosamente');

          // Si se agrega exitosamente, descontamos del inventario
          // Usamos el código específico del inventario
          const inventoryCode = itemData.inventoryCode || itemData.productCode || itemData.productName;

          console.log('📊 Intentando descontar del inventario:', {
            cantidad: itemData.quantity,
            codigo: inventoryCode,
            itemCompleto: itemData
          });

          // Verificar si tenemos un backend correcto
          console.log('🔗 URL del API de inventario:', `${this.inventoryService['apiUrl']}/deduct-stock`);

          this.inventoryService.deductStock(itemData.quantity, inventoryCode).subscribe({
            next: (inventoryResponse) => {
              console.log('✅ Inventario actualizado exitosamente:', inventoryResponse);
              this.snackBar.open(
                `✅ Producto agregado a la orden e inventario actualizado (${itemData.quantity} unidades de "${inventoryCode}" descontadas)`,
                'Cerrar',
                { duration: 5000 }
              );
              this.onRefreshSelectedOrder(this.selectedOrder!.id);
              this.onCloseAddItemModal();
            },
            error: (inventoryError) => {
              console.warn('⚠️ Producto agregado pero error al actualizar inventario:', inventoryError);
              console.warn('⚠️ Detalles del error de inventario:', {
                status: inventoryError.status,
                statusText: inventoryError.statusText,
                message: inventoryError.message,
                error: inventoryError.error,
                url: inventoryError.url
              });

              let errorMessage = '⚠️ Producto agregado a la orden. ';

              if (inventoryError.status === 404) {
                errorMessage += `Advertencia: Producto "${inventoryCode}" no encontrado en inventario`;
              } else if (inventoryError.status === 400) {
                errorMessage += `Advertencia: Stock insuficiente para "${inventoryCode}"`;
              } else if (inventoryError.status === 0) {
                errorMessage += 'Advertencia: No se pudo conectar con el servidor de inventario';
              } else {
                errorMessage += `Advertencia: Error ${inventoryError.status} al actualizar inventario`;
              }

              console.log('📝 Mensaje de error que se mostrará:', errorMessage);
              this.snackBar.open(errorMessage, 'Cerrar', { duration: 7000 });
              this.onRefreshSelectedOrder(this.selectedOrder!.id);
              this.onCloseAddItemModal();
            }
          });
        },
        error: (error) => {
          console.error('❌ Error adding item to order:', error);
          console.error('❌ Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url
          });

          let errorMessage = 'Error al agregar el producto a la orden';
          if (error.status === 404) {
            errorMessage = 'Error: Orden no encontrada';
          } else if (error.status === 400) {
            errorMessage = 'Error: Datos del producto inválidos';
          } else if (error.status === 0) {
            errorMessage = 'Error: No se pudo conectar con el servidor';
          }

          this.snackBar.open(errorMessage, 'Cerrar', { duration: 4000 });
        }
      });
    }
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

  // Métodos auxiliares para la UI
  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'schedule';
      case OrderStatus.IN_PROGRESS:
        return 'hourglass_empty';
      case OrderStatus.READY:
        return 'check_circle';
      case OrderStatus.DELIVERED:
        return 'local_shipping';
      case OrderStatus.CANCELLED:
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.IN_PROGRESS:
        return 'En Progreso';
      case OrderStatus.READY:
        return 'Lista';
      case OrderStatus.DELIVERED:
        return 'Entregada';
      case OrderStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }

  // Métodos para estadísticas
  getMesasOcupadas(): number {
    return this.mesas.filter(mesa => this.getMesaEstado(mesa) === 'Ocupada').length;
  }

  getMesasDisponibles(): number {
    return this.mesas.filter(mesa => this.getMesaEstado(mesa) === 'Disponible').length;
  }

  getTotalVentasHoy(): number {
    return this.todayOrders.reduce((sum, order) => {
      return sum + (order.valueToPay || 0);
    }, 0);
  }

  // Métodos adicionales para información detallada de mesas
  getMesaOrdersByStatus(mesa: number, status: string): Order[] {
    return this.getMesaOrders(mesa).filter(order => order.status === status);
  }

  getMesaTotal(mesa: number): number {
    return this.getMesaOrders(mesa).reduce((sum, order) => {
      return sum + (order.valueToPay || 0);
    }, 0);
  }

  // Método para obtener órdenes por estado
  getOrdersByStatus(status: string): Order[] {
    return this.todayOrders.filter(order => order.status === status);
  }

  // Métodos helper para los productos de la orden
  getOrderItemsCount(order: Order): number {
    if (!order) {
      return 0;
    }

    // Verificar diferentes posibles nombres de propiedades que puede tener el backend
    const items = order.orderItemList || (order as any).orderItems || (order as any).items || [];

    if (!Array.isArray(items)) {
      console.warn('orderItemList no es un array:', items);
      return 0;
    }

    const count = items.reduce((total, item: any) => total + (item.quantity || item.cantidad || 1), 0);
    console.log(`Orden ${order.id} tiene ${count} productos:`, items);
    return count;
  }

  calculateOrderTotal(order: Order): number {
    if (!order || !order.orderItemList) {
      return 0;
    }
    return order.orderItemList.reduce((total, item) => {
      return total + ((item.unitPrice || 0) * (item.quantity || 0));
    }, 0);
  }
}
