import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Order } from '../models';
import { ORDER_STATUS_CONFIG, OrderStatusConfig } from '../../../shared/constants/order-status.config';
import { OrderStatus } from '../../../shared/enums/order-status';

// Constantes para filtros de estado
const ALL_ORDERS_FILTER = 'ALL';
const ALL_ORDERS_LABEL = 'Todas las órdenes';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatTooltipModule
    ],
    templateUrl: './order-list.html',
    styleUrl: './order-list.css'
})
export class OrderList implements OnInit, OnChanges {
    @Input() orders: Order[] = [];
    @Input() loading = false;
    @Output() viewOrderDetails = new EventEmitter<Order>();
    @Output() changeOrderStatus = new EventEmitter<{ orderId: number, newStatus: OrderStatus }>();
    @Output() deleteOrder = new EventEmitter<number>();
    @Output() refreshOrders = new EventEmitter<void>();

    filteredOrders: Order[] = [];
    selectedStatusFilter: string = ALL_ORDERS_FILTER;
    selectedStatusLabelValue: string = ALL_ORDERS_LABEL;

    // Estados disponibles
    readonly orderStatuses: OrderStatusConfig[] = ORDER_STATUS_CONFIG;

    // Columnas de la tabla
    readonly displayedColumns: string[] = ['id', 'clientName', 'tableNumber', 'status', 'valueToPay', 'date', 'actions'];

    constructor() { }

    ngOnInit(): void {
        this.applyFilter();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['orders']) {
            this.applyFilter();
        }
    }

    applyFilter(): void {
        this.filteredOrders = this.selectedStatusFilter === ALL_ORDERS_FILTER
            ? this.orders
            : this.orders.filter(order => order.status === this.selectedStatusFilter);
    }

    // Métodos para calcular estadísticas usando métodos de array más eficientes
    getOrderCountByStatus(status: OrderStatus): number {
        return this.filteredOrders.filter(o => o.status === status).length;
    }

    getPendingCount(): number {
        return this.getOrderCountByStatus(OrderStatus.PENDING);
    }

    getInProgressCount(): number {
        return this.getOrderCountByStatus(OrderStatus.IN_PROGRESS);
    }

    getReadyCount(): number {
        return this.getOrderCountByStatus(OrderStatus.READY);
    }

    getStatusColor(status: string): string {
        if (status === OrderStatus.DELIVERED) {
            return 'disabled';
        }
        return this.orderStatuses.find(s => s.value === status)?.color || 'primary';
    }

    getStatusLabel(status: string): string {
        return this.orderStatuses.find(s => s.value === status)?.label || status;
    }

    // Método para verificar si una orden está entregada
    isOrderDelivered(status: string): boolean {
        return status === OrderStatus.DELIVERED;
    }

    onViewOrderDetails(order: Order): void {
        this.viewOrderDetails.emit(order);
    }

    onChangeOrderStatus(orderId: number, newStatus: OrderStatus): void {
        this.changeOrderStatus.emit({ orderId, newStatus });
    }

    onDeleteOrder(orderId: number): void {
        this.deleteOrder.emit(orderId);
    }

    onRefreshOrders(): void {
        this.refreshOrders.emit();
    }

    selectStatusFilter(value: string, label: string): void {
        this.selectedStatusFilter = value;
        this.selectedStatusLabelValue = label;
        this.applyFilter();
    }

    selectedStatusLabel(): string {
        return this.selectedStatusLabelValue;
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }
}
