// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { authGuard } from './core/auth/auth-guard';
import { guestGuard } from './core/auth/guest-guard';
import { adminGuard, adminChildGuard } from './core/auth/admin-guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },

            // Public
            { path: 'products', loadComponent: () => import('./pages/product-list/product-list').then((m) => m.ProductList) },
            { path: 'products/:id', loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail) },
            { path: 'cart', loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart) },

            // Guest-only
            { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
            { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register').then((m) => m.Register) },

            // Auth-only
            { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile) },
            { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout) },
            { path: 'order-success', canActivate: [authGuard], loadComponent: () => import('./pages/order-success/order-success').then((m) => m.OrderSuccess) },
        ],
    },

    // ✅ Admin LAZY
    {
        path: 'admin',
        canActivate: [adminGuard],
        canActivateChild: [adminChildGuard],
        loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.adminRoutes),
    },

    { path: '**', redirectTo: '' },
];