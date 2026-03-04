import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
    {
        path: '',
        title: 'Admin • Nexora',
        loadComponent: () =>
            import('./admin-layout/admin-layout').then((m) => m.AdminLayout),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

            {
                path: 'dashboard',
                title: 'Dashboard • Admin',
                loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
            },
            {
                path: 'products',
                title: 'Products • Admin',
                loadComponent: () =>
                    import('./products-admin/products-admin').then((m) => m.ProductsAdmin),
            },
            {
                path: 'orders',
                title: 'Orders • Admin',
                loadComponent: () =>
                    import('./orders-admin/orders-admin').then((m) => m.OrdersAdmin),
            },

            // ✅ safety net inside admin
            { path: '**', redirectTo: 'dashboard' },
        ],
    },
];