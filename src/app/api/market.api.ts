import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Asset } from '../models/asset.model';
import { MarketApi } from './market-api.interface';

@Injectable({ providedIn: 'root' })
export class MarketApiService implements MarketApi {
  private readonly http = inject(HttpClient);

  getMarkets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${environment.apiBaseUrl}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false,
      },
    });
  }
}
