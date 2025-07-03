import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderStatus } from '../../../shared/enums/order-status';
import { ORDER_STATUS_CONFIG, OrderStatusConfig } from '../../../shared/constants/order-status.config';
import type { Order, OrderItem } from '../models';
import { OrderService } from '../../../core/services/orderService/order-service';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatTableModule,
        MatDialogModule
    ],
    templateUrl: './order-detail.html',
    styleUrl: './order-detail.css'
})
export class OrderDetail {
    @Input() order: Order | null = null;
    @Input() visible = false;
    @Output() close = new EventEmitter<void>();
    @Output() refreshOrder = new EventEmitter<number>();
    @Output() addItem = new EventEmitter<number>();
    @Output() removeItem = new EventEmitter<{ orderId: number, itemId: number, quantity: number }>();

    selectedOrder: Order | null = null;

    // Usando la configuración del enum
    orderStatuses: OrderStatusConfig[] = ORDER_STATUS_CONFIG;

    // Columnas para la tabla de items
    displayedColumns: string[] = ['productName', 'quantity', 'unitPrice', 'totalPrice', 'actions'];

    constructor(
        private orderService: OrderService,
        private snackBar: MatSnackBar
    ) { }

    onClose() {
        this.close.emit();
    }

    onRefreshOrder() {
        if (this.order) {
            this.refreshOrder.emit(this.order.id);
        }
    }

    onAddItem() {
        if (this.order) {
            this.addItem.emit(this.order.id);
        }
    }

    onRemoveItem(itemId: number, quantity: number) {
        if (this.order) {
            this.removeItem.emit({
                orderId: this.order.id,
                itemId: itemId,
                quantity: quantity
            });
        }
    }

    getStatusColor(status: OrderStatus): string {
        if (status === 'DELIVERED') {
            return 'disabled'; // Color gris para órdenes entregadas
        }
        return this.orderStatuses.find(s => s.value === status)?.color || 'primary';
    }

    getStatusLabel(status: OrderStatus): string {
        return this.orderStatuses.find(s => s.value === status)?.label || status;
    }

    getStatusIcon(status: OrderStatus): string {
        return this.orderStatuses.find(s => s.value === status)?.icon || 'help';
    }

    // Método para verificar si una orden está entregada
    isOrderDelivered(): boolean {
        return this.order?.status === 'DELIVERED';
    }

    // Método para verificar si las acciones están habilitadas
    isActionsEnabled(): boolean {
        return !this.isOrderDelivered();
    }

    // Método para obtener el mensaje de estado
    getOrderStatusMessage(): string {
        if (this.isOrderDelivered()) {
            return 'Esta orden ya fue entregada y no puede ser modificada';
        }
        return '';
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

    getTotalItems(): number {
        return this.order?.orderItemList.reduce((total, item) => total + item.quantity, 0) || 0;
    }
}
