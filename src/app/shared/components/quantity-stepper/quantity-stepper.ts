import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  imports: [NgClass],
  templateUrl: './quantity-stepper.html',
  styleUrl: './quantity-stepper.scss',
})
export class QuantityStepper {
  /** Current value */
  @Input() value = 0;

  /** Minimum allowed (0 means “remove”) */
  @Input() min = 0;

  /** Maximum allowed (stock) */
  @Input() max = Number.MAX_SAFE_INTEGER;

  /** Disable control entirely */
  @Input() disabled = false;

  /** Emits whenever value changes */
  @Output() valueChange = new EventEmitter<number>();

  dec(): void {
    if (this.disabled) return;
    const next = Math.max(this.min, (this.value ?? 0) - 1);
    if (next !== this.value) this.valueChange.emit(next);
  }

  inc(): void {
    if (this.disabled) return;
    const next = Math.min(this.max, (this.value ?? 0) + 1);
    if (next !== this.value) this.valueChange.emit(next);
  }

  get canDec(): boolean {
    return !this.disabled && (this.value ?? 0) > this.min;
  }

  get canInc(): boolean {
    return !this.disabled && (this.value ?? 0) < this.max;
  }
}