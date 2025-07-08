import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-table-component',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinner],
  templateUrl: './table-component.html',
  styleUrl: './table-component.css'
})
export class TableComponent<T> {
  @Input() data: T[] = [];
  @Input() columns: { key: string; label: string; cell?: (row: T) => any }[] = [];
  @Input() loading = false;
  @Input() emptyIcon = 'table_view';
  @Input() emptyTitle = 'No hay datos';
  @Input() emptyDescription = '';
  @Input() actions: { icon: string; tooltip: string; action: (row: T) => void }[] = [];
  @Output() refresh = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();

  get displayedColumns() {
    return [...this.columns.map(c => c.key), ...(this.actions.length ? ['actions'] : [])];
  }
}

