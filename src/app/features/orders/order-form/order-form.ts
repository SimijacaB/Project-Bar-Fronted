import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class OrderForm implements OnInit {
    @Input() tableNumber?: number;
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

    ngOnInit() {
        if (this.tableNumber) {
            this.orderForm.patchValue({
                tableNumber: this.tableNumber
            });
        }
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
