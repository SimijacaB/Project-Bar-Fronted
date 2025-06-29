import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
    { path: 'products', loadComponent: () => import('./features/products/products').then(m => m.Products) },
    { path: 'orders', loadComponent: () => import('./features/orders/orders').then(m => m.Orders) },
    { path: 'inventory', loadComponent: () => import('./features/inventory/inventory').then(m => m.Inventory) },
    { path: 'bills', loadComponent: () => import('./features/bills/bills').then(m => m.Bills) },
    { path: '**', redirectTo: '' }
];
