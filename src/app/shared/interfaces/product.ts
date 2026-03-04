export type ProductBadge = 'New' | 'Best Seller' | 'Limited' | 'Eco';
export type ProductCategory = 'Accessories' | 'Home' | 'Tech' | 'Fashion';

export interface Product {
    id: string;
    name: string;
    brand: string;
    category: ProductCategory;
    price: number;
    oldPrice?: number;

    rating?: number;
    reviewsCount?: number;

    stock: number;
    status?: string;

    badge?: ProductBadge;
    images: string[];

    shortDescription: string;
    description: string;

    features?: string[];
    specs?: { label: string; value: string }[];
    colorOptions?: string[];
}