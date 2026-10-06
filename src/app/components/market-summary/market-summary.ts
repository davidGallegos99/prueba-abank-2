import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Asset } from '../../models/asset.model';

@Component({
  selector: 'app-market-summary',
  imports: [DecimalPipe],
  templateUrl: './market-summary.html',
  styleUrl: './market-summary.scss',
})
export class MarketSummary {
  readonly assets = input.required<Asset[]>();
  readonly favoriteCount = input.required<number>();
  readonly gainers = computed(
    () => this.assets().filter((asset) => (asset.price_change_percentage_24h ?? 0) > 0).length,
  );
  readonly volume = computed(() =>
    this.assets().reduce((sum, asset) => sum + (asset.total_volume ?? 0), 0),
  );
}
