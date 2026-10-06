import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { Change } from '../../change';
import { Asset } from '../../models/asset.model';

@Component({
  selector: 'app-asset-detail',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, UpperCasePipe, Change],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.scss',
})
export class AssetDetail {
  readonly asset = input.required<Asset | null>();
  readonly favorite = input.required<boolean>();
  readonly favoriteToggle = output<string>();
  readonly closed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('detail');

  open(): void {
    this.dialog().nativeElement.showModal();
  }
  closeDetail(): void {
    this.dialog().nativeElement.close();
  }
}
