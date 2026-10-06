import { Component, input, output } from '@angular/core';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Change } from '../../change';
import { Asset } from '../../models/asset.model';

@Component({
  selector: 'app-asset-list',
  imports: [CurrencyPipe, UpperCasePipe, Change],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.scss',
})
export class AssetList {
  readonly assets = input.required<Asset[]>();
  readonly favorites = input.required<string[]>();
  readonly loading = input.required<boolean>();
  readonly initialLoad = input.required<boolean>();
  readonly loadFailed = input.required<boolean>();
  readonly favoritesOnly = input.required<boolean>();
  readonly favoriteToggle = output<string>();
  readonly assetSelected = output<Asset>();
  readonly skeletons = Array.from({ length: 10 }, (_, index) => index);
}
