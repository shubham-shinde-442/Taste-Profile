export interface Food {
  id: number;
  name: string;
  image: string;
  category: "protein" | "carb" | "vegetable" | "other";
  tags: string[];
}

export interface Cuisine {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

export type SwipeChoice = "left" | "right" | "up" | "down";

export interface FoodDataset {
  foods: Food[];
  cuisines: Cuisine[];
}
