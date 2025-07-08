import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Ingredient } from '../models';
import { UnitOfMeasure } from '../../../shared/enums/unit-of-measure';
import { TableComponent } from '../../../shared/components/table-component/table-component';

@Component({
  selector: 'app-ingredient-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    TableComponent
  ],
  templateUrl: './ingredient-list.html',
  styleUrl: './ingredient-list.css'
})
export class IngredientList {
  @Input() ingredients: Ingredient[] = [];
  @Input() loading = false;
  @Output() editIngredient = new EventEmitter<Ingredient>();
  @Output() deleteIngredient = new EventEmitter<string>();
  @Output() refreshIngredients = new EventEmitter<void>();
  @Output() addIngredient = new EventEmitter<void>();

  columns = [
    { key: 'code', label: '#', cell: (row: Ingredient) => row.code },
    { key: 'name', label: 'Nombre', cell: (row: Ingredient) => row.name },
    { key: 'unitOfMeasure', label: 'Unidad', cell: (row: Ingredient) => this.getUnitOfMeasureLabel(row.unitOfMeasure) }
  ];

  tableActions = [
    {
      icon: 'edit',
      tooltip: 'Editar ingrediente',
      action: (row: Ingredient) => this.onEdit(row)
    },
    {
      icon: 'delete',
      tooltip: 'Eliminar ingrediente',
      action: (row: Ingredient) => this.onDelete(row.code)
    }
  ];

  getUnitOfMeasureLabel(unit: UnitOfMeasure): string {
    const labels: Record<UnitOfMeasure, string> = {
      [UnitOfMeasure.ML]: 'Mililitros',
      [UnitOfMeasure.ONZ]: 'Onzas',
      [UnitOfMeasure.GR]: 'Gramos',
      [UnitOfMeasure.UN]: 'Unidades'
    };
    return labels[unit] || unit;
  }

  onEdit(ingredient: Ingredient): void {
    this.editIngredient.emit(ingredient);
  }

  onDelete(code: string): void {
    this.deleteIngredient.emit(code);
  }

  onRefresh(): void {
    this.refreshIngredients.emit();
  }

  onAddIngredient(): void {
    this.addIngredient.emit();
  }
}
