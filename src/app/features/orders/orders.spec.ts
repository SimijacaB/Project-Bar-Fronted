import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { Orders } from './orders';
import { OrderService } from '../../../services/orderService/order-service';

describe('Orders', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;
  let orderService: OrderService;

  // Datos de ejemplo para las pruebas
  const mockOrders = [
    {
      id: 1,
      clientName: 'Juan Pérez',
      tableNumber: 5,
      waiterUserName: 'María García',
      notes: 'Sin hielo en las bebidas',
      status: 'PENDING',
      date: '2024-01-15T14:30:00',
      orderItemList: [
        {
          id: 1,
          productName: 'Cerveza Artesanal',
          quantity: 2,
          unitPrice: 15000,
          totalPrice: 30000
        },
        {
          id: 2,
          productName: 'Snacks',
          quantity: 1,
          unitPrice: 8000,
          totalPrice: 8000
        }
      ],
      valueToPay: 38000
    },
    {
      id: 2,
      clientName: 'Ana López',
      tableNumber: 3,
      waiterUserName: 'Carlos Rodríguez',
      notes: '',
      status: 'IN_PROGRESS',
      date: '2024-01-15T15:00:00',
      orderItemList: [
        {
          id: 3,
          productName: 'Cóctel Margarita',
          quantity: 1,
          unitPrice: 25000,
          totalPrice: 25000
        }
      ],
      valueToPay: 25000
    },
    {
      id: 3,
      clientName: 'Roberto Silva',
      tableNumber: 8,
      waiterUserName: 'Laura Martínez',
      notes: 'Extra limón',
      status: 'READY',
      date: '2024-01-15T15:15:00',
      orderItemList: [
        {
          id: 4,
          productName: 'Whisky Premium',
          quantity: 1,
          unitPrice: 35000,
          totalPrice: 35000
        },
        {
          id: 5,
          productName: 'Cerveza Artesanal',
          quantity: 1,
          unitPrice: 15000,
          totalPrice: 15000
        }
      ],
      valueToPay: 50000
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Orders,
        HttpClientTestingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
        MatDialogModule
      ],
      providers: [OrderService]
    }).compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    spyOn(orderService, 'getAllOrders').and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next(mockOrders);
        return { unsubscribe: () => { } };
      }
    } as any);

    component.ngOnInit();
    expect(orderService.getAllOrders).toHaveBeenCalled();
  });

  it('should filter orders by status', () => {
    component.orders = mockOrders;
    component.selectedStatusFilter = 'PENDING';

    component.applyFilter();

    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].status).toBe('PENDING');
  });

  it('should show all orders when filter is ALL', () => {
    component.orders = mockOrders;
    component.selectedStatusFilter = 'ALL';

    component.applyFilter();

    expect(component.filteredOrders.length).toBe(3);
  });

  it('should get correct status label', () => {
    expect(component.getStatusLabel('PENDING')).toBe('Pendiente');
    expect(component.getStatusLabel('IN_PROGRESS')).toBe('En Progreso');
    expect(component.getStatusLabel('READY')).toBe('Lista');
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor('PENDING')).toBe('warn');
    expect(component.getStatusColor('IN_PROGRESS')).toBe('accent');
    expect(component.getStatusColor('READY')).toBe('primary');
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(15000);
    expect(formatted).toContain('$15,000');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15T14:30:00');
    expect(formatted).toContain('15/01/2024');
  });

  it('should open new order modal', () => {
    component.openNewOrderModal();
    expect(component.showNewOrderModal).toBe(true);
  });

  it('should close new order modal', () => {
    component.showNewOrderModal = true;
    component.closeNewOrderModal();
    expect(component.showNewOrderModal).toBe(false);
  });

  it('should open order details', () => {
    const order = mockOrders[0];
    component.viewOrderDetails(order);
    expect(component.selectedOrder).toBe(order);
    expect(component.showOrderDetails).toBe(true);
  });

  it('should close order details', () => {
    component.selectedOrder = mockOrders[0];
    component.showOrderDetails = true;
    component.closeOrderDetails();
    expect(component.selectedOrder).toBe(null);
    expect(component.showOrderDetails).toBe(false);
  });

  it('should validate new order form', () => {
    const form = component.newOrderForm;

    // Form should be invalid initially
    expect(form.valid).toBe(false);

    // Set required fields
    form.patchValue({
      clientName: 'Test Client',
      tableNumber: 1,
      waiterUserName: 'Test Waiter'
    });

    expect(form.valid).toBe(true);
  });

  it('should validate add item form', () => {
    const form = component.addItemForm;

    // Form should be invalid initially
    expect(form.valid).toBe(false);

    // Set required fields
    form.patchValue({
      productId: '1',
      quantity: 2
    });

    expect(form.valid).toBe(true);
  });

  it('should calculate statistics correctly', () => {
    component.orders = mockOrders;
    component.applyFilter();

    const pendingCount = component.filteredOrders.filter(o => o.status === 'PENDING').length;
    const inProgressCount = component.filteredOrders.filter(o => o.status === 'IN_PROGRESS').length;
    const readyCount = component.filteredOrders.filter(o => o.status === 'READY').length;

    expect(pendingCount).toBe(1);
    expect(inProgressCount).toBe(1);
    expect(readyCount).toBe(1);
  });

  // Pruebas de integración con el servicio
  it('should call service to create order', () => {
    spyOn(orderService, 'saveOrder').and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({ success: true });
        return { unsubscribe: () => { } };
      }
    } as any);

    component.newOrderForm.patchValue({
      clientName: 'Test Client',
      tableNumber: 1,
      waiterUserName: 'Test Waiter',
      notes: 'Test notes'
    });

    component.createOrder();
    expect(orderService.saveOrder).toHaveBeenCalled();
  });

  it('should call service to change order status', () => {
    spyOn(orderService, 'changeOrderStatus').and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({ success: true });
        return { unsubscribe: () => { } };
      }
    } as any);

    component.changeOrderStatus(1, 'READY');
    expect(orderService.changeOrderStatus).toHaveBeenCalledWith(1, 'READY');
  });

  it('should call service to delete order', () => {
    spyOn(orderService, 'deleteOrder').and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({ success: true });
        return { unsubscribe: () => { } };
      }
    } as any);

    // Mock confirm dialog
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteOrder(1);
    expect(orderService.deleteOrder).toHaveBeenCalledWith(1);
  });

  it('should call service to add item to order', () => {
    spyOn(orderService, 'addOrderItemToOrder').and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({ success: true });
        return { unsubscribe: () => { } };
      }
    } as any);

    component.selectedOrder = mockOrders[0];
    component.addItemForm.patchValue({
      productId: '1',
      quantity: 2
    });

    component.addItemToOrder();
    expect(orderService.addOrderItemToOrder).toHaveBeenCalled();
  });

  it('should call service to remove item from order', () => {
    spyOn(orderService, 'removeOrderItemFromOrder').and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({ success: true });
        return { unsubscribe: () => { } };
      }
    } as any);

    component.removeItemFromOrder(1, 1);
    expect(orderService.removeOrderItemFromOrder).toHaveBeenCalledWith(1, 1);
  });
});
