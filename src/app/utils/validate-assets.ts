import { Asset } from '../models/asset.model';

export function isMarketResponse(value: unknown): value is Asset[] {
  if (!Array.isArray(value) || value.length < 10) return false;
  return value.every(
    (asset) =>
      asset !== null &&
      typeof asset === 'object' &&
      typeof asset.id === 'string' &&
      typeof asset.name === 'string' &&
      typeof asset.symbol === 'string' &&
      typeof asset.image === 'string' &&
      typeof asset.last_updated === 'string' &&
      Number.isFinite(Date.parse(asset.last_updated)) &&
      [
        'current_price',
        'price_change_percentage_24h',
        'market_cap',
        'market_cap_rank',
        'total_volume',
        'high_24h',
        'low_24h',
        'circulating_supply',
      ].every(
        (key) =>
          asset[key] === null || (typeof asset[key] === 'number' && Number.isFinite(asset[key])),
      ),
  );
}
