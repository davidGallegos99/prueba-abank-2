import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Asset } from '../models/asset.model';

export interface MarketApi {
  getMarkets(): Observable<Asset[]>;
}

export const MARKET_API = new InjectionToken<MarketApi>('MARKET_API');
