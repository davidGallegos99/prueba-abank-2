import { Injectable, DestroyRef, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { MARKET_API } from '../api/market-api.interface';
import { Asset } from '../models/asset.model';
import { Filters } from '../models/market-filters.model';
import { filterAssets } from '../utils/filter-assets';
import { isMarketResponse } from '../utils/validate-assets';

@Injectable({ providedIn: 'root' })
export class MarketStore {
  private readonly api = inject(MARKET_API);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private started = false;
  private readonly assetsState = signal<Asset[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');
  private readonly updatedAtState = signal<Date | null>(null);
  private readonly favoritesState = signal<string[]>(this.readFavorites());
  private readonly storageErrorState = signal('');
  private readonly selectedState = signal<Asset | null>(null);
  private readonly filtersState = signal<Filters>({
    query: '',
    favoritesOnly: false,
    movement: 'all',
    minimum: null,
    maximum: null,
    sort: 'market_cap_rank:asc',
  });

  readonly assets = this.assetsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly updatedAt = this.updatedAtState.asReadonly();
  readonly favorites = this.favoritesState.asReadonly();
  readonly storageError = this.storageErrorState.asReadonly();
  readonly filters = this.filtersState.asReadonly();
  readonly visible = computed(() => filterAssets(this.assets(), this.favorites(), this.filters()));
  readonly detailAsset = computed(
    () =>
      this.assets().find((asset) => asset.id === this.selectedState()?.id) ?? this.selectedState(),
  );

  start(): void {
    if (this.started) return;
    this.started = true;
    void this.refresh();
    const refreshWhenVisible = () => {
      if (!this.document.hidden) void this.refresh();
    };
    const timer = setInterval(refreshWhenVisible, environment.refreshIntervalMs);
    this.document.addEventListener('visibilitychange', refreshWhenVisible);
    this.destroyRef.onDestroy(() => {
      clearInterval(timer);
      this.document.removeEventListener('visibilitychange', refreshWhenVisible);
    });
  }

  async refresh(): Promise<void> {
    if (this.loading()) return;
    this.loadingState.set(true);
    this.errorState.set('');
    try {
      const assets = await firstValueFrom(
        this.api.getMarkets().pipe(timeout(environment.requestTimeoutMs)),
      );
      if (!isMarketResponse(assets)) throw new Error('Invalid market response');
      this.assetsState.set(assets);
      this.updatedAtState.set(new Date());
    } catch (error) {
      this.errorState.set(
        error instanceof HttpErrorResponse && error.status === 429
          ? 'CoinGecko alcanzó su límite de consultas. Reintentaremos automáticamente en un minuto.'
          : 'No pudimos actualizar el mercado. Revisa tu conexión o intenta nuevamente.',
      );
    } finally {
      this.loadingState.set(false);
    }
  }

  updateFilters(patch: Partial<Filters>): void {
    this.filtersState.update((filters) => ({ ...filters, ...patch }));
  }

  selectAsset(asset: Asset | null): void {
    this.selectedState.set(asset);
  }

  toggleFavorite(id: string): void {
    this.favoritesState.update((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
    try {
      localStorage.setItem('marketwatch-favorites', JSON.stringify(this.favorites()));
      this.storageErrorState.set('');
    } catch {
      this.storageErrorState.set(
        'El navegador no permite guardar favoritos. Se conservarán durante esta sesión.',
      );
    }
  }

  private readFavorites(): string[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem('marketwatch-favorites') ?? '[]');
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }
}
