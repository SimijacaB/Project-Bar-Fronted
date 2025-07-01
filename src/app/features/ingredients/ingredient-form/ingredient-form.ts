import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Ingredient } from '../models';
import { UnitOfMeasure } from '../../../shared/enums/unit-of-measure';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ingredient-form',
  imports: [FormsModule],
  templateUrl: './ingredient-form.html',
  styleUrl: './ingredient-form.css'
})
export class IngredientForm implements OnInit {
  @Input() ingredient: Ingredient | null = null;
  @Output() save = new EventEmitter<Ingredient>();
  @Output() update = new EventEmitter<Ingredient>();
  @Output() close = new EventEmitter<void>();

  localIngredient: Ingredient = { id: 0, code: '', name: '', unitOfMeasure: UnitOfMeasure.ML };

  codeLetter = 'A';
  codeNumber = '';
  codeUnit: UnitOfMeasure = UnitOfMeasure.ML;
  codeSerial = '';
  codeType = 'i';

  readonly codeLetters: string[] = this.generateAlphabetArray();

  /**
   * Inicializa el componente. Si se proporciona un ingrediente,
   * carga sus datos en el formulario.
   */
  ngOnInit(): void {
    if (this.ingredient) {
      this.localIngredient = { ...this.ingredient };
      // Parsear el código si existe
      if (this.localIngredient.code) {
        // Formato: A99-ML-0000I
        const match = this.localIngredient.code.match(/^([A-Z])([0-9]{2})-([A-Z]+)-([0-9]{4})([IP])$/i);
        if (match) {
          this.codeLetter = match[1];
          this.codeNumber = match[2];
          this.codeUnit = match[3] as UnitOfMeasure;
          this.codeSerial = match[4];
          this.codeType = match[5].toLowerCase();
        }
      }
    }
    this.updateCode();
  }

  /**
   * Actualiza el código del ingrediente combinando las partes individuales.
   */
  updateCode(): void {
    this.localIngredient.code = `${this.codeLetter}${this.codeNumber}-${this.codeUnit}-${this.codeSerial}${this.codeType.toUpperCase()}`;
  }

  /**
   * Se ejecuta cuando cambia cualquier parte del código para mantenerlo actualizado.
   */
  onCodePartChange(): void {
    this.updateCode();
  }

  /**
   * Gestiona el envío del formulario.
   * Emite un evento de guardado o actualización según si el ingrediente es nuevo o existente.
   */
  onSubmit(): void {
    this.updateCode();
    console.log('Enviando ingrediente desde el formulario:', this.localIngredient);
    if (this.ingredient) {
      this.update.emit(this.localIngredient);
    } else {
      this.save.emit(this.localIngredient);
    }
  }

  /**
   * Genera un array con las letras del abecedario.
   * @returns Un array de strings, donde cada string es una letra del abecedario.
   */
  private generateAlphabetArray(): string[] {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  }
}
