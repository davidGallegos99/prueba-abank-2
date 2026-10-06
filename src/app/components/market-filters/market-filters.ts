import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Filters } from '../../models/market-filters.model';

@Component({
  selector: 'app-market-filters',
  imports: [FormsModule],
  templateUrl: './market-filters.html',
  styleUrl: './market-filters.scss',
})
export class MarketFilters {
  readonly filters = input.required<Filters>();
  readonly resultCount = input.required<number>();
  readonly filtersChange = output<Partial<Filters>>();
}
