import { filterAssets } from './filter-assets';
import { assets } from '../testing/market.fixture';

const filters = {
  query: '',
  favoritesOnly: false,
  movement: 'all',
  minimum: null,
  maximum: null,
  sort: 'market_cap_rank:asc',
};

describe('Market filters', () => {
  it('combines search, favorites, price range and movement without mutating source', () => {
    expect(
      filterAssets(assets, ['coin-8'], {
        ...filters,
        query: ' C8 ',
        favoritesOnly: true,
        minimum: 8,
        maximum: 10,
        movement: 'up',
      }),
    ).toEqual([assets[8]]);
    expect(filterAssets(assets, [], { ...filters, query: 'COIN 2' })).toEqual([assets[2]]);
    expect(filterAssets(assets, [], { ...filters, minimum: 10, maximum: 1 })).toEqual([]);
    expect(assets[0].id).toBe('coin-0');
  });
  it('sorts price and change in both directions, putting missing values last', () => {
    const input = [
      ...assets,
      { ...assets[0], id: 'missing', current_price: null, price_change_percentage_24h: null },
    ];
    for (const field of ['current_price', 'price_change_percentage_24h']) {
      expect(filterAssets(input, [], { ...filters, sort: `${field}:asc` })[0].id).toBe('coin-0');
      const descending = filterAssets(input, [], { ...filters, sort: `${field}:desc` });
      expect(descending[0].id).toBe('coin-9');
      expect(descending.at(-1)?.id).toBe('missing');
    }
  });
});
