import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Bill {
  id: number;
  billNumber: string;
  clientName: string;
  date: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-bills',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './bills.html',
  styleUrl: './bills.css'
})
export class Bills implements OnInit {
  bills: Bill[] = [];
  loading = false;
  displayedColumns: string[] = ['billNumber', 'clientName', 'date', 'subtotal', 'tax', 'total', 'status', 'paymentMethod', 'actions'];

  constructor() { }

  ngOnInit() {
    this.loadBills();
  }

  loadBills() {
    this.loading = true;
    // TODO: Implementar servicio de facturas
    // Simulación de datos
    setTimeout(() => {
      this.bills = [
        {
          id: 1,
          billNumber: 'FAC-001',
          clientName: 'Juan Pérez',
          date: new Date(),
          subtotal: 25000,
          tax: 4750,
          total: 29750,
          status: 'PAID',
          paymentMethod: 'Efectivo'
        },
        {
          id: 2,
          billNumber: 'FAC-002',
          clientName: 'María García',
          date: new Date(),
          subtotal: 18000,
          tax: 3420,
          total: 21420,
          status: 'PENDING',
          paymentMethod: 'Tarjeta'
        }
      ];
      this.loading = false;
    }, 1000);
  }

  onRefresh() {
    this.loadBills();
  }

  onGenerateBill() {
    // TODO: Implementar lógica para generar factura
    console.log('Generate bill clicked');
  }

  onViewBill(bill: Bill) {
    // TODO: Implementar lógica para ver factura
    console.log('View bill:', bill);
  }

  onPrintBill(bill: Bill) {
    // TODO: Implementar lógica para imprimir factura
    console.log('Print bill:', bill);
  }

  onDeleteBill(billId: number) {
    // TODO: Implementar lógica para eliminar factura
    console.log('Delete bill:', billId);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PAID':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'CANCELLED':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Pagada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}
