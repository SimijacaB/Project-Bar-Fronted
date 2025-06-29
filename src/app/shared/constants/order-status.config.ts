import { OrderStatus } from "../enums/order-status";

export interface OrderStatusConfig {
  value: OrderStatus;
  label: string;
  color: string;
  icon?: string;
}


export const ORDER_STATUS_CONFIG: OrderStatusConfig[] = [
  {
    value: OrderStatus.PENDING,
    label: 'Pendiente',
    color: 'default',
    icon: 'hourglass_empty'
  },
  {
    value: OrderStatus.IN_PROGRESS,
    label: 'En Progreso',
    color: 'accent',
    icon: 'pending'
  },
  {
    value: OrderStatus.READY,
    label: 'Lista',
    color: 'primary',
    icon: 'check_circle'
  },
  {
    value: OrderStatus.DELIVERED,
    label: 'Entregada',
    color: 'success',
    icon: 'local_shipping'
  },
  {
    value: OrderStatus.CANCELLED,
    label: 'Cancelada',
    color: 'warn',
    icon: 'cancel'
  }
];
