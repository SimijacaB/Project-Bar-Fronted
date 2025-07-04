import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
    { path: 'products', loadComponent: () => import('./features/products/products').then(m => m.Products) },
    { path: 'orders', loadComponent: () => import('./features/orders/orders').then(m => m.Orders) },
    { path: 'ingredients', loadComponent: () => import('./features/ingredients/ingredients').then(m => m.Ingredients) },
    { path: 'bills', loadComponent: () => import('./features/bills/bills').then(m => m.Bills) },
    { path: '**', redirectTo: '' }
];
