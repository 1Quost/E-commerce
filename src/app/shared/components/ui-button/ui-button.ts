import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

type Variant = 'primary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './ui-button.html',
  styleUrls: ['./ui-button.scss'],
})
export class UiButton {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: Variant = 'primary';
  @Input() size: Size = 'md';
  @Input() block = false;
  @Input() disabled = false;
  @Input() loading = false;
}