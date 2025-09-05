export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    available: boolean;
    code?: string; // Código del producto para inventario
}