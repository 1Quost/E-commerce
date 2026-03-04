import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:mousedown', ['$event'])
  onDown(ev: MouseEvent): void {
    const target = ev.target as Node | null;
    if (!target) return;
    const inside = this.el.nativeElement.contains(target);
    if (!inside) this.clickOutside.emit(ev);
  }
}