import { IRecipe } from "./recipe.interface";

export interface ICategory {
  id: number;
  name: string;
  description?: string;
  recipes?: IRecipe[];
  createdAt: Date;
}
