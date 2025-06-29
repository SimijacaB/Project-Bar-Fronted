import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-order-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule
    ],
    templateUrl: './order-form.html',
    styleUrl: './order-form.css'
})
export class OrderFormComponent {
    @Output() createOrder = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();

    orderForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.orderForm = this.fb.group({
            clientName: ['', Validators.required],
            tableNumber: ['', [Validators.required, Validators.min(1)]],
            waiterUserName: ['', Validators.required],
            notes: ['']
        });
    }

    onSubmit() {
        if (this.orderForm.valid) {
            this.createOrder.emit(this.orderForm.value);
        } else {
            this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
        }
    }

    onClose() {
        this.close.emit();
    }

    resetForm() {
        this.orderForm.reset();
    }
} 