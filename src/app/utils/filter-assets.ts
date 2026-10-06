import { Asset } from '../models/asset.model';
import { Filters } from '../models/market-filters.model';

export function filterAssets(assets: Asset[], favorites: string[], filters: Filters): Asset[] {
  const query = filters.query.trim().toLowerCase();
  const [field, direction] = filters.sort.split(':');
  const key = field as 'current_price' | 'price_change_percentage_24h' | 'market_cap_rank';
  return assets
    .filter(
      (asset) =>
        (asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query)) &&
        (!filters.favoritesOnly || favorites.includes(asset.id)) &&
        (filters.movement === 'all' ||
          (asset.price_change_percentage_24h !== null &&
            (filters.movement === 'up'
              ? asset.price_change_percentage_24h > 0
              : asset.price_change_percentage_24h < 0))) &&
        (filters.minimum === null ||
          (asset.current_price !== null && asset.current_price >= filters.minimum)) &&
        (filters.maximum === null ||
          (asset.current_price !== null && asset.current_price <= filters.maximum)),
    )
    .sort((a, b) => {
      if (a[key] === null) return b[key] === null ? 0 : 1;
      if (b[key] === null) return -1;
      return (a[key]! - b[key]!) * (direction === 'desc' ? -1 : 1);
    });
}
