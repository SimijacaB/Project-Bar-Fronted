import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IngredientList } from './ingredient-list/ingredient-list';
import { IngredientForm } from './ingredient-form/ingredient-form';
import { Ingredient } from './models';
import { IngredientService } from '../../core/services/ingredientService/ingredient-service';

@Component({
    selector: 'app-ingredients',
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        IngredientList,
        IngredientForm
    ],
    templateUrl: './ingredients.html',
    styleUrl: './ingredients.css'
})
export class Ingredients implements OnInit {
    ingredients: Ingredient[] = [];
    loading = false;
    showForm = false;
    selectedIngredient: Ingredient | null = null;

    constructor(private ingredientService: IngredientService) { }

    ngOnInit(): void {
        console.log('Ingredients component initialized');
        this.loadIngredients();
    }

    loadIngredients(): void {
        console.log('Loading ingredients...');
        this.loading = true;
        this.ingredientService.getAllIngredients().subscribe({
            next: (data) => {
                console.log('Ingredients loaded successfully:', data);
                this.ingredients = data || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading ingredients:', error);
                console.error('Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    url: error.url
                });
                this.loading = false;
                alert('Error al cargar los ingredientes. Verifica que el backend esté funcionando.');
            }
        });
    }

    //Cuando se hace clic en el boton nuevo ingrediente se abre el modal
    onOpenNewIngredientModal(): void {
        this.selectedIngredient = null;
        this.showForm = true;
    }

    // Cuando se hace clic en el boton editar ingrediente se abre el modal y carga el ingrediente seleccionado
    onEditIngredient(ingredient: Ingredient): void {
        this.selectedIngredient = ingredient;
        this.showForm = true;
    }

    onDeleteIngredient(code: string): void {
        if (confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
            this.ingredientService.deleteIngredient(code).subscribe({
                next: () => {
                    this.loadIngredients();
                },
                error: (error) => {
                    console.error('Error deleting ingredient:', error);
                }
            });
        }
    }

    
    onCreateIngredient(ingredient: Ingredient): void {
        this.ingredientService.saveIngredient(ingredient).subscribe({
            next: () => {
                this.loadIngredients();
                this.showForm = false;
            },
            error: (error) => {
                console.error('Error creating ingredient:', error);
            }
        });
    }

    onUpdateIngredient(ingredient: Ingredient): void {
        this.ingredientService.updateIngredient(ingredient).subscribe({
            next: () => {
                this.loadIngredients();
                this.showForm = false;
            },
            error: (error) => {
                console.error('Error updating ingredient:', error);
            }
        });
    }

    onCloseForm(): void {
        this.showForm = false;
        this.selectedIngredient = null;
    }

    onRefreshIngredients(): void {
        this.loadIngredients();
    }

    
} 