export interface IRecipe {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  ingredients: string;
  imageUrl: string;
  userId: number;
  categoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export enum Difficulty {
    EASY,
    MEDIUM,
    HARD
}