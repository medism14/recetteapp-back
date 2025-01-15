import { IFavorite } from "./favorite.interface";
import { IRecipe } from "./recipe.interface";

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  recipes?: IRecipe[];
  favorites?: IFavorite[];
  createdAt?: Date;
}