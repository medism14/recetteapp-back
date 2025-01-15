export interface IFavorite {
  userId: number;
  recipeId: number;
  createdAt: Date;
  recipe?: any;
  category?: any;
}