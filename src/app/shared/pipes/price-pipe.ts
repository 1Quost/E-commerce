import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true,
})
export class PricePipe implements PipeTransform {
  transform(value: number, currency = '$', decimals = 2): string {
    const n = Number(value);
    if (Number.isNaN(n)) return `${currency}0.00`;
    return `${currency}${n.toFixed(decimals)}`;
  }
}