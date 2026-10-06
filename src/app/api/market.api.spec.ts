import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { MarketApiService } from './market.api';
import { assets } from '../testing/market.fixture';

it('requests markets using the configured base URL and query parameters', () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const http = TestBed.inject(HttpTestingController);
  const received = vi.fn();
  TestBed.inject(MarketApiService).getMarkets().subscribe(received);
  const request = http.expectOne(
    (request) => request.url === `${environment.apiBaseUrl}/coins/markets`,
  );
  expect(request.request.method).toBe('GET');
  expect(request.request.params.get('vs_currency')).toBe('usd');
  expect(request.request.params.get('per_page')).toBe('50');
  expect(request.request.params.get('order')).toBe('market_cap_desc');
  expect(request.request.params.get('page')).toBe('1');
  expect(request.request.params.get('sparkline')).toBe('false');
  request.flush(assets);
  expect(received).toHaveBeenCalledWith(assets);
  http.verify();
});
