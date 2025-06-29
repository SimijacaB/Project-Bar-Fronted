import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/productService/product-service';

// Interfaz para Product
interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    available: boolean;
}

@Component({
    selector: 'app-order-item-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './order-item-form.html',
    styleUrl: './order-item-form.css'
})
export class OrderItemFormComponent implements OnInit {
    @Input() orderId: number = 0;
    @Input() orderStatus: string = '';
    @Output() addItem = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();

    itemForm: FormGroup;
    products: Product[] = [];
    selectedProduct: Product | null = null;
    loading = false;
    error = false;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private snackBar: MatSnackBar
    ) {
        this.itemForm = this.fb.group({
            productId: [{ value: '', disabled: this.orderStatus === 'DELIVERED' }, Validators.required],
            quantity: [{ value: '', disabled: this.orderStatus === 'DELIVERED' }, [Validators.required, Validators.min(1)]]
        });

    }

    ngOnInit() {
        console.log('OrderItemFormComponent ngOnInit - orderId:', this.orderId);
        console.log('OrderItemFormComponent ngOnInit - orderStatus:', this.orderStatus);
        this.loadProducts();
        this.checkOrderStatus();
    }

    //Inicio: Una vez la orden esté en estado entregada, no va a poder modificarse
    checkOrderStatus() {
        if (this.orderStatus === 'DELIVERED') {
            this.snackBar.open('No se pueden modificar órdenes entregadas', 'Cerrar', { duration: 3000 });
            // Deshabilitar el formulario completamente
            this.itemForm.disable();
            this.close.emit();
        }
    }

    isOrderDelivered(): boolean {
        return this.orderStatus === 'DELIVERED';
    }

    getOrderStatusMessage(): string {
        if (this.orderStatus === 'DELIVERED') {
            return 'Esta orden ya fue entregada y no puede ser modificada';
        }
        return '';
    }

    // Método para verificar si el formulario está habilitado
    isFormEnabled(): boolean {
        return !this.isOrderDelivered();
    }
    //Finaliza la verificación

    loadProducts() {
        this.loading = true;
        this.error = false;
        console.log('🔄 Iniciando carga de productos...');

        this.productService.getAllProducts().subscribe({
            next: (response: any) => {
                console.log('📦 Respuesta completa del API:', response);
                console.log('📦 Tipo de respuesta:', typeof response);
                console.log('📦 Es array?', Array.isArray(response));

                // Manejar diferentes formatos de respuesta
                let productsData: any[] = [];

                if (Array.isArray(response)) {
                    productsData = response;
                } else if (response && response.data && Array.isArray(response.data)) {
                    productsData = response.data;
                } else if (response && response.content && Array.isArray(response.content)) {
                    productsData = response.content;
                } else if (response && typeof response === 'object') {
                    // Si es un objeto, intentar extraer los productos
                    const keys = Object.keys(response);
                    console.log('🔑 Claves del objeto respuesta:', keys);

                    // Buscar la clave que contenga los productos
                    for (const key of keys) {
                        if (Array.isArray(response[key])) {
                            productsData = response[key];
                            console.log('✅ Productos encontrados en clave:', key);
                            break;
                        }
                    }
                }

                console.log('📦 Productos extraídos:', productsData);

                if (productsData.length > 0) {
                    // Filtrar productos disponibles y mapear a la interfaz correcta
                    this.products = productsData
                        .filter(product => {
                            // Verificar si el producto está disponible
                            const isAvailable = product.available !== false && product.available !== 'false';
                            console.log(`Producto ${product.name || product.id}: available = ${product.available}, isAvailable = ${isAvailable}`);
                            return isAvailable;
                        })
                        .map(product => ({
                            id: product.id,
                            name: product.name || product.productName || 'Sin nombre',
                            price: product.price || product.unitPrice || 0,
                            category: product.category || 'Sin categoría',
                            available: product.available !== false
                        }));

                    console.log('✅ Productos procesados:', this.products);
                } else {
                    console.warn('⚠️ No se encontraron productos en la respuesta');
                    this.products = [];
                }

                this.loading = false;
            },
            error: (error) => {
                console.error('❌ Error loading products:', error);
                console.error('❌ Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    url: error.url
                });

                this.error = true;
                this.loading = false;
                this.products = [];

                this.snackBar.open(
                    `Error al cargar los productos: ${error.status} ${error.statusText}`,
                    'Cerrar',
                    { duration: 5000 }
                );
            }
        });
    }

    onProductChange() {
        const productId = this.itemForm.get('productId')?.value;
        console.log('🎯 Producto seleccionado ID:', productId);
        console.log('🎯 Productos disponibles:', this.products);
        console.log('🎯 Tipo de productId:', typeof productId);

        // Buscar el producto por ID
        this.selectedProduct = this.products.find(p => {
            console.log(`Comparando: p.id (${p.id}, tipo: ${typeof p.id}) con productId (${productId}, tipo: ${typeof productId})`);
            return p.id === productId;
        }) || null;

        console.log('🎯 Producto encontrado:', this.selectedProduct);

        if (this.selectedProduct) {
            console.log('✅ Producto cargado correctamente:', {
                id: this.selectedProduct.id,
                name: this.selectedProduct.name,
                price: this.selectedProduct.price
            });
        } else {
            console.warn('⚠️ No se encontró el producto con ID:', productId);
            console.warn('⚠️ Productos disponibles:', this.products.map(p => ({ id: p.id, name: p.name })));
        }

        // Trigger change detection
        setTimeout(() => {
            console.log('🔄 Estado después del timeout:', {
                selectedProduct: this.selectedProduct,
                formValue: this.itemForm.get('productId')?.value
            });
        }, 100);
    }

    onQuantityChange() {
        // Este método se puede usar para validaciones adicionales o cálculos en tiempo real
        const quantity = this.itemForm.get('quantity')?.value;
        console.log('📊 Cantidad cambiada:', quantity);

        if (quantity && quantity < 1) {
            this.itemForm.get('quantity')?.setValue(1);
        }
    }

    onSubmit() {
        // Mensaje cuando la orden está en estado entragada
        if (this.isOrderDelivered()) {
            this.snackBar.open('No se pueden modificar órdenes entregadas', 'Cerrar', { duration: 3000 });
            return;
        }

        if (this.itemForm.valid && this.selectedProduct) {
            const formData = this.itemForm.value;
            const itemData = {
                productName: this.selectedProduct.name,
                quantity: formData.quantity
            };
            console.log('📤 Enviando item data:', itemData);
            this.addItem.emit(itemData);
        } else {
            console.warn('⚠️ Formulario inválido:', {
                valid: this.itemForm.valid,
                selectedProduct: this.selectedProduct,
                formErrors: this.itemForm.errors,
                productIdErrors: this.itemForm.get('productId')?.errors,
                quantityErrors: this.itemForm.get('quantity')?.errors
            });
            this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
        }
    }

    onClose() {
        this.close.emit();
    }

    resetForm() {
        this.itemForm.reset();
        this.selectedProduct = null;
    }
}
