import dataset from "./foods.json";
import type { Cuisine, Food } from "../types/food";

interface RawDataset {
  foods: Food[];
  cuisines: Cuisine[];
}

const typedDataset = dataset as RawDataset;

export const foods = typedDataset.foods;
export const cuisines = typedDataset.cuisines;
