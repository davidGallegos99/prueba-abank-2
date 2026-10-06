import { Component, inject, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Asset } from './models/asset.model';
import { MarketStore } from './store/market.store';
import { MarketSummary } from './components/market-summary/market-summary';
import { MarketFilters } from './components/market-filters/market-filters';
import { AssetList } from './components/asset-list/asset-list';
import { AssetDetail } from './components/asset-detail/asset-detail';

@Component({
  selector: 'app-root',
  imports: [DatePipe, MarketSummary, MarketFilters, AssetList, AssetDetail],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly store = inject(MarketStore);
  private readonly dialog = viewChild(AssetDetail);

  constructor() {
    this.store.start();
  }

  openDetail(asset: Asset): void {
    this.store.selectAsset(asset);
    this.dialog()?.open();
  }
}
