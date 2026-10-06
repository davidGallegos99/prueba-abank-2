import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NEVER, Subject, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MarketApi, MARKET_API } from '../api/market-api.interface';
import { Asset } from '../models/asset.model';
import { assets } from '../testing/market.fixture';
import { MarketStore } from './market.store';

const api = { getMarkets: vi.fn<MarketApi['getMarkets']>() } satisfies MarketApi;
const configure = () =>
  TestBed.configureTestingModule({ providers: [{ provide: MARKET_API, useValue: api }] });

beforeEach(() => {
  localStorage.clear();
  api.getMarkets.mockReset().mockReturnValue(of(assets));
  configure();
});
afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('loads through the API contract, prevents overlap and keeps data across failure and recovery', async () => {
  const store = TestBed.inject(MarketStore);
  const response = new Subject<Asset[]>();
  api.getMarkets.mockReturnValueOnce(response);
  const initial = store.refresh();
  expect(store.loading()).toBe(true);
  await store.refresh();
  expect(api.getMarkets).toHaveBeenCalledTimes(1);
  response.next(assets);
  await initial;
  expect(store.assets()).toEqual(assets);
  expect(store.updatedAt()).toBeInstanceOf(Date);
  api.getMarkets.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 429 })));
  await store.refresh();
  expect(store.assets()).toEqual(assets);
  expect(store.error()).toContain('límite');
  expect(store.loading()).toBe(false);
  await store.refresh();
  expect(store.error()).toBe('');
});

it('rejects malformed responses without replacing the previous successful data', async () => {
  const store = TestBed.inject(MarketStore);
  await store.refresh();
  api.getMarkets.mockReturnValueOnce(
    of([{ ...assets[0], current_price: NaN }, ...assets.slice(1)]),
  );
  await store.refresh();
  expect(store.assets()).toEqual(assets);
  expect(store.error()).toBeTruthy();
});

it('derives the visible list and updates selected detail when refreshed', async () => {
  const store = TestBed.inject(MarketStore);
  await store.refresh();
  store.selectAsset(assets[8]);
  store.toggleFavorite('coin-8');
  store.updateFilters({ query: 'c8', favoritesOnly: true });
  expect(store.visible()).toEqual([assets[8]]);
  const updated = assets.map((asset) => ({ ...asset, current_price: 99 }));
  api.getMarkets.mockReturnValueOnce(of(updated));
  await store.refresh();
  expect(store.detailAsset()?.current_price).toBe(99);
  store.selectAsset(null);
  expect(store.detailAsset()).toBeNull();
});

it('restores persisted favorites when the store is recreated', () => {
  TestBed.inject(MarketStore).toggleFavorite('coin-1');
  expect(JSON.parse(localStorage.getItem('marketwatch-favorites')!)).toEqual(['coin-1']);
  TestBed.resetTestingModule();
  configure();
  const recreated = TestBed.inject(MarketStore);
  expect(recreated.favorites()).toEqual(['coin-1']);
  recreated.toggleFavorite('coin-1');
  expect(recreated.favorites()).toEqual([]);
});

it('survives corrupt storage and unavailable persistence', () => {
  localStorage.setItem('marketwatch-favorites', '{invalid');
  const store = TestBed.inject(MarketStore);
  expect(store.favorites()).toEqual([]);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('denied');
  });
  store.toggleFavorite('coin-2');
  expect(store.favorites()).toEqual(['coin-2']);
  expect(store.storageError()).toBeTruthy();
});

it('starts polling only once, skips hidden tabs, refreshes on return and cleans up on destruction', async () => {
  vi.useFakeTimers();
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const store = TestBed.inject(MarketStore);
  store.start();
  store.start();
  await vi.advanceTimersByTimeAsync(0);
  expect(api.getMarkets).toHaveBeenCalledTimes(1);
  hidden.mockReturnValue(true);
  await vi.advanceTimersByTimeAsync(environment.refreshIntervalMs);
  expect(api.getMarkets).toHaveBeenCalledTimes(1);
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  await vi.advanceTimersByTimeAsync(0);
  expect(api.getMarkets).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(environment.refreshIntervalMs);
  expect(api.getMarkets).toHaveBeenCalledTimes(3);
  TestBed.resetTestingModule();
  document.dispatchEvent(new Event('visibilitychange'));
  await vi.advanceTimersByTimeAsync(environment.refreshIntervalMs);
  expect(api.getMarkets).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

it('ends a stalled request after the configured timeout', async () => {
  vi.useFakeTimers();
  api.getMarkets.mockReturnValueOnce(NEVER);
  const store = TestBed.inject(MarketStore);
  const request = store.refresh();
  await vi.advanceTimersByTimeAsync(environment.requestTimeoutMs);
  await request;
  expect(store.loading()).toBe(false);
  expect(store.error()).toBeTruthy();
});
