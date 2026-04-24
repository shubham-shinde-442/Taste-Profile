import { useEffect } from "react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FoodCard } from "../components/FoodCard";
import { ProgressBar } from "../components/ProgressBar";
import { SwipeActions } from "../components/SwipeActions";
import type { SwipeChoice } from "../types/food";
import { useTasteProfile } from "../contexts/TasteProfileContext";
import { useSwipe } from "../hooks/useSwipe";

export function SwipePage(): JSX.Element {
  const { currentFood, reactToFood, progress, isCompleted } = useTasteProfile();
  const navigate = useNavigate();
  const [swipeDirection, setSwipeDirection] = useState<SwipeChoice | null>(null);
  const [previewDirection, setPreviewDirection] = useState<SwipeChoice | null>(null);

  const handleSwipe = useCallback(
    (choice: SwipeChoice) => {
      if (!currentFood || swipeDirection) {
        return;
      }

      setSwipeDirection(choice);
    },
    [currentFood, swipeDirection]
  );

  const handleSwipeComplete = useCallback(
    (choice: SwipeChoice) => {
      reactToFood(choice);
      setSwipeDirection(null);
      setPreviewDirection(null);
    },
    [reactToFood]
  );

  const { bindings, swipeByDirection, swipeByKeyboard } = useSwipe({
    threshold: 62,
    previewThreshold: 18,
    onSwipe: handleSwipe,
    onSwipePreview: (choice) => {
      if (swipeDirection) {
        return;
      }

      setPreviewDirection(choice);
    }
  });

  useEffect(() => {
    if (isCompleted) {
      navigate("/results", { replace: true });
    }
  }, [isCompleted, navigate]);

  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
      }

      swipeByKeyboard(event.key);
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [swipeByKeyboard]);

  if (!currentFood) {
    return (
      <section className="page done-view">
        <h1>All done</h1>
        <p>Your taste profile is ready.</p>
      </section>
    );
  }

  return (
    <section className="page swipe-page">
      <ProgressBar value={progress} />

      <FoodCard
        key={currentFood.id}
        food={currentFood}
        draggable={!swipeDirection}
        previewDirection={previewDirection}
        swipeDirection={swipeDirection}
        swipeBindings={swipeDirection ? undefined : bindings}
        onSwipeComplete={handleSwipeComplete}
      />
      <SwipeActions onAction={swipeByDirection} />

    </section>
  );
}
