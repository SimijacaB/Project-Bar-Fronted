import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface DropdownOption {
  value: any;
  label: string;
  icon?: string;
  disabled?: boolean;
  color?: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatRippleModule],
  templateUrl: './custom-dropdown.html',
  styleUrl: './custom-dropdown.css'
})
export class CustomDropdown implements OnInit {
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: any = null;
  @Input() placeholder: string = 'Seleccionar opción';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() error: string = '';
  @Input() searchable: boolean = false;
  @Input() multiple: boolean = false;
  @Input() clearable: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'outlined' | 'filled' | 'standard' = 'outlined';
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary';

  @Output() selectionChange = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild('dropdownRef', { static: false }) dropdownRef!: ElementRef;

  isOpen: boolean = false;
  searchTerm: string = '';
  filteredOptions: DropdownOption[] = [];
  selectedOptions: any[] = [];

  ngOnInit() {
    this.filteredOptions = [...this.options];
    if (this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedOptions = [...this.selectedValue];
    }
  }

  ngOnChanges() {
    this.filteredOptions = this.searchable ? this.filterOptions() : [...this.options];
    if (this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedOptions = [...this.selectedValue];
    }
  }

  toggleDropdown() {
    if (!this.disabled && !this.loading) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        setTimeout(() => {
          const searchInput = this.dropdownRef?.nativeElement?.querySelector('.search-input');
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }
    }
  }

  selectOption(option: DropdownOption) {
    if (option.disabled) return;

    if (this.multiple) {
      const index = this.selectedOptions.findIndex(val => val === option.value);
      if (index > -1) {
        this.selectedOptions.splice(index, 1);
      } else {
        this.selectedOptions.push(option.value);
      }
      this.selectionChange.emit([...this.selectedOptions]);
    } else {
      this.selectedValue = option.value;
      this.selectionChange.emit(option.value);
      this.isOpen = false;
    }
  }

  clearSelection() {
    if (this.multiple) {
      this.selectedOptions = [];
      this.selectionChange.emit([]);
    } else {
      this.selectedValue = null;
      this.selectionChange.emit(null);
    }
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filteredOptions = this.filterOptions();
    this.searchChange.emit(this.searchTerm);
  }

  private filterOptions(): DropdownOption[] {
    if (!this.searchTerm) return [...this.options];

    return this.options.filter(option =>
      option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getSelectedLabel(): string {
    if (this.multiple) {
      if (this.selectedOptions.length === 0) return this.placeholder;
      if (this.selectedOptions.length === 1) {
        const option = this.options.find(opt => opt.value === this.selectedOptions[0]);
        return option?.label || '';
      }
      return `${this.selectedOptions.length} seleccionados`;
    } else {
      const option = this.options.find(opt => opt.value === this.selectedValue);
      return option?.label || this.placeholder;
    }
  }

  isSelected(value: any): boolean {
    if (this.multiple) {
      return this.selectedOptions.includes(value);
    }
    return this.selectedValue === value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.dropdownRef?.nativeElement?.contains(event.target)) {
      this.isOpen = false;
    }
  }

  @HostListener('keydown.escape')
  onEscapeKey() {
    this.isOpen = false;
  }
}
