import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { MARKET_API } from './api/market-api.interface';
import { MarketApiService } from './api/market.api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    { provide: MARKET_API, useExisting: MarketApiService },
  ],
};
