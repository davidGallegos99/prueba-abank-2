import { Asset } from '../models/asset.model';

export const assets: Asset[] = Array.from({ length: 10 }, (_, index) => ({
  id: `coin-${index}`,
  name: `Coin ${index}`,
  symbol: `c${index}`,
  image: '',
  current_price: index + 1,
  price_change_percentage_24h: index - 5,
  market_cap: 1000,
  market_cap_rank: index + 1,
  total_volume: 100,
  high_24h: 12,
  low_24h: 1,
  circulating_supply: 100,
  last_updated: '2026-10-05T00:00:00Z',
}));
