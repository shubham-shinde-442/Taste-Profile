import { useCallback, useMemo } from "react";
import type { PanInfo } from "framer-motion";
import type { SwipeChoice } from "../types/food";

interface UseSwipeOptions {
  threshold?: number;
  previewThreshold?: number;
  onSwipe: (choice: SwipeChoice) => void;
  onSwipePreview?: (choice: SwipeChoice | null) => void;
}

interface SwipeBindings {
  drag: true | "x" | "y";
  dragConstraints: { top: number; right: number; bottom: number; left: number };
  dragElastic: number;
  onDrag: (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onDragEnd: (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

interface UseSwipeResult {
  bindings: SwipeBindings;
  swipeByKeyboard: (key: string) => void;
  swipeByDirection: (choice: SwipeChoice) => void;
}

const KEY_TO_CHOICE: Record<string, SwipeChoice> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down"
};

export function useSwipe({ threshold = 90, previewThreshold = 36, onSwipe, onSwipePreview }: UseSwipeOptions): UseSwipeResult {
  const swipeByDirection = useCallback(
    (choice: SwipeChoice) => {
      onSwipe(choice);
    },
    [onSwipe]
  );

  const swipeByKeyboard = useCallback(
    (key: string) => {
      const choice = KEY_TO_CHOICE[key];
      if (choice) {
        onSwipe(choice);
      }
    },
    [onSwipe]
  );

  const bindings = useMemo<SwipeBindings>(
    () => ({
      drag: true,
      dragConstraints: { top: 0, right: 0, bottom: 0, left: 0 },
      dragElastic: 0.22,
      onDrag: (_event, info) => {
        const { offset } = info;
        const absX = Math.abs(offset.x);
        const absY = Math.abs(offset.y);
        const isVerticalIntent = absY >= absX * 0.7;

        if (isVerticalIntent) {
          if (offset.y < -previewThreshold) onSwipePreview?.("up");
          else if (offset.y > previewThreshold) onSwipePreview?.("down");
          else onSwipePreview?.(null);
          return;
        }

        if (offset.x > previewThreshold) onSwipePreview?.("right");
        else if (offset.x < -previewThreshold) onSwipePreview?.("left");
        else onSwipePreview?.(null);
      },
      onDragEnd: (_event, info) => {
        const { offset } = info;
        const absX = Math.abs(offset.x);
        const absY = Math.abs(offset.y);
        const isVerticalIntent = absY >= absX * 0.7;
        let choice: SwipeChoice | null = null;

        if (isVerticalIntent) {
          if (offset.y < -threshold) choice = "up";
          if (offset.y > threshold) choice = "down";

          if (choice) {
            onSwipe(choice);
          } else {
            onSwipePreview?.(null);
          }
          return;
        }

        if (offset.x > threshold) choice = "right";
        if (offset.x < -threshold) choice = "left";

        if (choice) {
          onSwipe(choice);
        } else {
          onSwipePreview?.(null);
        }
      }
    }),
    [onSwipe, onSwipePreview, previewThreshold, threshold]
  );

  return { bindings, swipeByKeyboard, swipeByDirection };
}
