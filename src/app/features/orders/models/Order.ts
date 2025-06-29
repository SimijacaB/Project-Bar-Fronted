import { OrderStatus } from '../../../shared/enums/order-status';
import { OrderItem } from './OrderItem';

export interface Order {
    id: number;
    clientName: string;
    tableNumber: number;
    waiterUserName: string;
    notes: string;
    status: OrderStatus;
    date: string;
    orderItemList: OrderItem[];
    valueToPay: number;
}