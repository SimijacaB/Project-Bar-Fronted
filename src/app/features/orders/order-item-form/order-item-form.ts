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
import { Product } from '../../products/models/Product';
import { CustomDropdown, DropdownOption } from '../../../shared/components/custom-dropdown/custom-dropdown';

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
        MatProgressSpinnerModule,
        CustomDropdown
    ],
    templateUrl: './order-item-form.html',
    styleUrl: './order-item-form.css'
})
export class OrderItemForm implements OnInit {
    @Input() orderId: number = 0;
    @Input() orderStatus: string = '';
    @Output() addItem = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();

    itemForm: FormGroup;
    products: Product[] = [];
    productDropdownOptions: DropdownOption[] = [];
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
                    console.log('🔍 Analizando primer producto para ver estructura:', productsData[0]);
                    console.log('🔍 Campos disponibles en productos:', Object.keys(productsData[0] || {}));

                    // Filtrar productos disponibles y mapear a la interfaz correcta
                    this.products = productsData
                        .filter(product => {
                            // Verificar si el producto está disponible
                            const isAvailable = product.available !== false && product.available !== 'false';
                            console.log(`Producto ${product.name || product.id}: available = ${product.available}, isAvailable = ${isAvailable}`);
                            return isAvailable;
                        })
                        .map(product => {
                            // Buscar el código de inventario en múltiples campos posibles
                            let inventoryCode = null;

                            // Lista de campos donde puede estar el código de inventario
                            const possibleCodeFields = [
                                'code', 'productCode', 'inventoryCode', 'sku',
                                'barcode', 'itemCode', 'productId', 'id'
                            ];

                            // Buscar código en los campos del producto
                            for (const field of possibleCodeFields) {
                                if (product[field] && typeof product[field] === 'string') {
                                    // Verificar si el campo contiene un código con formato válido
                                    const fieldValue = product[field].toString().trim();
                                    if (fieldValue.length > 0) {
                                        inventoryCode = fieldValue;
                                        console.log(`📋 Código encontrado en campo '${field}': ${inventoryCode} para producto ${product.name}`);
                                        break;
                                    }
                                }
                            }

                            // Si no se encontró código, generar uno basado en el ID
                            if (!inventoryCode) {
                                inventoryCode = `PROD_${product.id}`;
                                console.log(`📋 Código generado para producto ${product.name}: ${inventoryCode}`);
                            }

                            console.log(`📋 Código final de inventario para '${product.name}': ${inventoryCode}`);

                            return {
                                id: product.id,
                                name: product.name || product.productName || 'Sin nombre',
                                price: product.price || product.unitPrice || 0,
                                category: product.category || 'Sin categoría',
                                available: product.available !== false,
                                code: inventoryCode
                            };
                        });

                    console.log('✅ Productos procesados con códigos:', this.products);
                    this.generateProductDropdownOptions();
                } else {
                    console.warn('⚠️ No se encontraron productos en la respuesta');
                    this.products = [];
                    this.productDropdownOptions = [];
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

    private generateProductDropdownOptions(): void {
        this.productDropdownOptions = this.products.map(product => ({
            value: product.id,
            label: `${product.name} - $${this.formatCurrency(product.price)}`,
            icon: 'restaurant_menu',
            disabled: !product.available
        }));
    }

    onProductSelectionChange(productId: number): void {
        const selectedProduct = this.products.find(p => p.id === productId);
        if (selectedProduct) {
            this.selectedProduct = selectedProduct;
            this.itemForm.patchValue({ productId: productId });
            this.onProductChange();
        }
    }

    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    onProductChange() {
        const productId = this.itemForm.get('productId')?.value;
        console.log('🎯 onProductChange llamado');
        console.log('🎯 Producto seleccionado ID:', productId);
        console.log('🎯 Productos disponibles:', this.products);
        console.log('🎯 Tipo de productId:', typeof productId);

        // Limpiar selección anterior
        this.selectedProduct = null;

        if (productId && this.products.length > 0) {
            // Buscar el producto por ID (asegurándose de comparar tipos correctamente)
            this.selectedProduct = this.products.find(p => {
                console.log(`🔍 Comparando: p.id (${p.id}, tipo: ${typeof p.id}) con productId (${productId}, tipo: ${typeof productId})`);
                // Convertir ambos a string para comparar o convertir ambos a number
                return p.id.toString() === productId.toString();
            }) || null;

            if (this.selectedProduct) {
                console.log('✅ Producto encontrado y seleccionado:', {
                    id: this.selectedProduct.id,
                    name: this.selectedProduct.name,
                    price: this.selectedProduct.price,
                    category: this.selectedProduct.category
                });
            } else {
                console.warn('⚠️ No se encontró el producto con ID:', productId);
                console.warn('⚠️ Productos disponibles IDs:', this.products.map(p => ({ id: p.id, name: p.name })));
            }
        } else {
            console.log('ℹ️ ProductId vacío o no hay productos disponibles');
        }

        // Forzar detección de cambios
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
        console.log('🚀 onSubmit iniciado');
        console.log('🔍 Estado del formulario:', {
            valid: this.itemForm.valid,
            errors: this.itemForm.errors,
            productIdValue: this.itemForm.get('productId')?.value,
            quantityValue: this.itemForm.get('quantity')?.value,
            productIdErrors: this.itemForm.get('productId')?.errors,
            quantityErrors: this.itemForm.get('quantity')?.errors
        });
        console.log('🔍 Producto seleccionado:', this.selectedProduct);
        console.log('🔍 ¿Orden entregada?:', this.isOrderDelivered());
        console.log('🔍 ¿Formulario habilitado?:', this.isFormEnabled());

        // Mensaje cuando la orden está en estado entregada
        if (this.isOrderDelivered()) {
            console.log('⚠️ Orden entregada, no se puede agregar producto');
            this.snackBar.open('No se pueden modificar órdenes entregadas', 'Cerrar', { duration: 3000 });
            return;
        }

        if (this.itemForm.valid && this.selectedProduct) {
            const formData = this.itemForm.value;
            const itemData = {
                productId: this.selectedProduct.id,
                productName: this.selectedProduct.name,
                productCode: this.selectedProduct.code || this.selectedProduct.name, // Usar el código del inventario
                inventoryCode: this.selectedProduct.code || `PROD_${this.selectedProduct.id}`, // Código específico para inventario
                quantity: formData.quantity,
                unitPrice: this.selectedProduct.price,
                totalPrice: this.selectedProduct.price * formData.quantity
            };
            console.log('📤 Enviando item data completo:', itemData);
            console.log('📊 Código de inventario que se usará:', itemData.inventoryCode);
            this.addItem.emit(itemData);
        } else {
            console.warn('⚠️ Formulario inválido o producto no seleccionado');
            console.warn('⚠️ Detalles:', {
                formValid: this.itemForm.valid,
                selectedProduct: this.selectedProduct,
                formErrors: this.itemForm.errors,
                productIdErrors: this.itemForm.get('productId')?.errors,
                quantityErrors: this.itemForm.get('quantity')?.errors,
                productIdValue: this.itemForm.get('productId')?.value,
                quantityValue: this.itemForm.get('quantity')?.value
            });

            let errorMessage = 'Por favor completa todos los campos requeridos';

            if (!this.selectedProduct) {
                errorMessage = 'Por favor selecciona un producto';
            } else if (!this.itemForm.get('quantity')?.value) {
                errorMessage = 'Por favor ingresa la cantidad';
            } else if (this.itemForm.get('quantity')?.value <= 0) {
                errorMessage = 'La cantidad debe ser mayor a 0';
            }

            this.snackBar.open(errorMessage, 'Cerrar', { duration: 3000 });
        }
    }

    onClose() {
        this.close.emit();
    }

    resetForm() {
        this.itemForm.reset();
        this.selectedProduct = null;
    }

    debugInventoryCodes() {
        console.log('🐛 =======  DEBUG CÓDIGOS DE INVENTARIO  =======');
        console.log('🐛 Total de productos:', this.products.length);

        this.products.forEach((product, index) => {
            console.log(`🐛 Producto ${index + 1}:`, {
                id: product.id,
                name: product.name,
                code: product.code,
                price: product.price,
                available: product.available
            });
        });

        console.log('🐛 Producto seleccionado actualmente:', this.selectedProduct);

        if (this.selectedProduct) {
            console.log('🐛 Código que se enviará al inventario:', this.selectedProduct.code);
        }

        // Buscar específicamente el producto "B01-UN-0002P"
        const targetProduct = this.products.find(p =>
            p.code === 'B01-UN-0002P' ||
            p.name.includes('B01-UN-0002P') ||
            p.id.toString() === 'B01-UN-0002P'
        );

        if (targetProduct) {
            console.log('🎯 PRODUCTO B01-UN-0002P ENCONTRADO:', targetProduct);
        } else {
            console.log('❌ PRODUCTO B01-UN-0002P NO ENCONTRADO');
            console.log('🔍 Códigos disponibles:', this.products.map(p => p.code));
        }

        console.log('🐛 =======================================');

        // Mostrar un snackbar con resumen detallado
        const debugInfo = `Debug: ${this.products.length} productos cargados. ` +
            `Producto seleccionado: ${this.selectedProduct?.name || 'Ninguno'}. ` +
            `Código: ${this.selectedProduct?.code || 'N/A'}. ` +
            `B01-UN-0002P encontrado: ${targetProduct ? 'SÍ' : 'NO'}`;

        this.snackBar.open(debugInfo, 'Cerrar', { duration: 15000 });
    }
}
