import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class OrderListComponent implements OnInit {
    @Input() orders: Order[] = [];
    @Input() loading = false;
    @Output() viewOrderDetails = new EventEmitter<Order>();
    @Output() changeOrderStatus = new EventEmitter<{ orderId: number, newStatus: string }>();
    @Output() deleteOrder = new EventEmitter<number>();
    @Output() refreshOrders = new EventEmitter<void>();

    filteredOrders: Order[] = [];
    selectedStatusFilter = 'ALL';
    selectedStatusLabelValue = 'Todas las órdenes';

    // Estados disponibles
    orderStatuses: OrderStatusConfig[] = ORDER_STATUS_CONFIG;


    // Columnas de la tabla
    displayedColumns: string[] = ['id', 'clientName', 'tableNumber', 'status', 'valueToPay', 'date', 'actions'];

    constructor() { }

    ngOnInit() {
        this.applyFilter();
    }

    ngOnChanges() {
        this.applyFilter();
    }

    applyFilter() {
        this.filteredOrders = this.selectedStatusFilter === 'ALL'
            ? this.orders
            : this.orders.filter(order => order.status === this.selectedStatusFilter);
    }

    // Métodos para calcular estadísticas
    getPendingCount(): number {
        return this.filteredOrders.filter(o => o.status === 'PENDING').length;
    }

    getInProgressCount(): number {
        return this.filteredOrders.filter(o => o.status === 'IN_PROGRESS').length;
    }

    getReadyCount(): number {
        return this.filteredOrders.filter(o => o.status === 'READY').length;
    }

    getStatusColor(status: string): string {
        const statusConfig = this.orderStatuses.find(s => s.value === status);
        if (status === 'DELIVERED') {
            return 'disabled'; // Color gris para órdenes entregadas
        }
        return statusConfig?.color || 'primary';
    }

    getStatusLabel(status: string): string {
        return this.orderStatuses.find(s => s.value === status)?.label || status;
    }

    // Método para verificar si una orden está entregada
    isOrderDelivered(status: string): boolean {
        return status === 'DELIVERED';
    }

    onViewOrderDetails(order: Order) {
        this.viewOrderDetails.emit(order);
    }

    onChangeOrderStatus(orderId: number, newStatus: OrderStatus) {
        this.changeOrderStatus.emit({ orderId, newStatus });
    }

    onDeleteOrder(orderId: number) {
        this.deleteOrder.emit(orderId);
    }

    onRefreshOrders() {
        this.refreshOrders.emit();
    }

    selectStatusFilter(value: string, label: string) {
        this.selectedStatusFilter = value;
        this.selectedStatusLabelValue = label;
        this.applyFilter();
    }

    selectedStatusLabel() {
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