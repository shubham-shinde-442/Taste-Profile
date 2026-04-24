import { createContext, useContext, useMemo } from "react";
import { foods } from "../data/foodData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Food, SwipeChoice } from "../types/food";

type ReactionMap = Record<number, SwipeChoice>;

interface StoredState {
  currentIndex: number;
  reactions: ReactionMap;
}

interface TasteProfileContextValue {
  foods: Food[];
  currentIndex: number;
  currentFood: Food | null;
  progress: number;
  reactions: ReactionMap;
  likedFoods: Food[];
  dislikedFoods: Food[];
  superLikedFoods: Food[];
  unsureFoods: Food[];
  reactToFood: (choice: SwipeChoice) => void;
  resetProfile: () => void;
  isCompleted: boolean;
}

const defaultState: StoredState = {
  currentIndex: 0,
  reactions: {}
};

const STORAGE_KEY = "calorai-taste-state";

const TasteProfileContext = createContext<TasteProfileContextValue | undefined>(undefined);

interface TasteProfileProviderProps {
  children: React.ReactNode;
}

export function TasteProfileProvider({ children }: TasteProfileProviderProps): JSX.Element {
  const [state, setState] = useLocalStorage<StoredState>(STORAGE_KEY, defaultState);

  const totalFoods = foods.length;
  const currentFood = foods[state.currentIndex] ?? null;
  const isCompleted = state.currentIndex >= totalFoods;

  const categorizedFoods = useMemo(() => {
    const likedFoods: Food[] = [];
    const dislikedFoods: Food[] = [];
    const superLikedFoods: Food[] = [];
    const unsureFoods: Food[] = [];

    foods.forEach((food) => {
      const reaction = state.reactions[food.id];
      if (reaction === "right") likedFoods.push(food);
      if (reaction === "left") dislikedFoods.push(food);
      if (reaction === "up") superLikedFoods.push(food);
      if (reaction === "down") unsureFoods.push(food);
    });

    return { likedFoods, dislikedFoods, superLikedFoods, unsureFoods };
  }, [state.reactions]);

  const value = useMemo<TasteProfileContextValue>(
    () => ({
      foods,
      currentIndex: state.currentIndex,
      currentFood,
      reactions: state.reactions,
      progress: totalFoods === 0 ? 0 : Math.min(state.currentIndex / totalFoods, 1),
      reactToFood: (choice) => {
        if (!currentFood || isCompleted) {
          return;
        }

        setState({
          currentIndex: Math.min(state.currentIndex + 1, totalFoods),
          reactions: {
            ...state.reactions,
            [currentFood.id]: choice
          }
        });
      },
      resetProfile: () => setState(defaultState),
      isCompleted,
      ...categorizedFoods
    }),
    [categorizedFoods, currentFood, isCompleted, setState, state.currentIndex, state.reactions, totalFoods]
  );

  return <TasteProfileContext.Provider value={value}>{children}</TasteProfileContext.Provider>;
}

export function useTasteProfile(): TasteProfileContextValue {
  const context = useContext(TasteProfileContext);
  if (!context) {
    throw new Error("useTasteProfile must be used inside TasteProfileProvider");
  }

  return context;
}
