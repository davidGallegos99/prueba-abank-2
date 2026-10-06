import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-change',
  imports: [DecimalPipe],
  template: `<span
    class="change"
    [class.positive]="value() !== null && value()! > 0"
    [class.negative]="value() !== null && value()! < 0"
  >
    @if (value() === null) {
      —
    } @else {
      {{ value()! > 0 ? '↗ +' : value()! < 0 ? '↘ ' : '' }}{{ value() | number: '1.2-2' }}%
    }
  </span>`,
})
export class Change {
  readonly value = input.required<number | null>();
}
