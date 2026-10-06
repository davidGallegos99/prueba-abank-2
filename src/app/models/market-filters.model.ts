export interface Filters {
  query: string;
  favoritesOnly: boolean;
  movement: string;
  minimum: number | null;
  maximum: number | null;
  sort: string;
}
