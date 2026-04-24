import { motion } from "framer-motion";
import type { MotionProps } from "framer-motion";
import type { Food } from "../types/food";
import type { SwipeChoice } from "../types/food";

interface FoodCardProps {
  food: Food;
  draggable?: boolean;
  swipeBindings?: Pick<MotionProps, "drag" | "dragConstraints" | "dragElastic" | "onDrag" | "onDragEnd">;
  previewDirection?: SwipeChoice | null;
  swipeDirection?: SwipeChoice | null;
  onSwipeComplete?: (choice: SwipeChoice) => void;
}

const SWIPE_OFFSETS: Record<SwipeChoice, { x: number; rotate: number }> = {
  left: { x: -260, rotate: -14 },
  right: { x: 260, rotate: 14 },
  up: { x: 0, rotate: -6 },
  down: { x: 0, rotate: 6 }
};

const BADGE_PREVIEW_DELAY = 0.6;
const SWIPE_EXIT_DURATION = 0.5;

const SWIPE_BADGE: Record<SwipeChoice, { label: string; className: string }> = {
  left: { label: "No", className: "swipe-badge-left" },
  right: { label: "Yes", className: "swipe-badge-right" },
  up: { label: "Superlike ✨", className: "swipe-badge-up" },
  down: { label: "Unsure", className: "swipe-badge-down" }
};

export function FoodCard({
  food,
  draggable = false,
  swipeBindings,
  previewDirection,
  swipeDirection,
  onSwipeComplete
}: FoodCardProps): JSX.Element {
  const exiting = swipeDirection ? SWIPE_OFFSETS[swipeDirection] : null;
  const activeDirection = swipeDirection ?? previewDirection ?? null;
  const badge = activeDirection ? SWIPE_BADGE[activeDirection] : null;

  return (
    <motion.article
      className="swipe-card"
      {...(draggable && swipeBindings ? swipeBindings : {})}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={exiting ? { opacity: 0, scale: 0.92, x: exiting.x, rotate: exiting.rotate } : { opacity: 1, scale: 1, y: 0, x: 0 }}
      transition={
        exiting
          ? { duration: SWIPE_EXIT_DURATION, delay: BADGE_PREVIEW_DELAY, ease: "easeOut" }
          : { duration: 0.24, ease: "easeOut" }
      }
      whileDrag={{ rotate: 8, scale: 1.03 }}
      onAnimationComplete={() => {
        if (swipeDirection && onSwipeComplete) {
          onSwipeComplete(swipeDirection);
        }
      }}
      role="group"
      aria-label={`Food card ${food.name}`}
    >
      <div className="swipe-card-overlay" />
      {swipeDirection === "up" ? (
        <div className="swipe-superlike-celebration" aria-hidden>
          <span className="superlike-burst-ring" />
          <span className="superlike-spark superlike-spark-1" />
          <span className="superlike-spark superlike-spark-2" />
          <span className="superlike-spark superlike-spark-3" />
          <span className="superlike-spark superlike-spark-4" />
        </div>
      ) : null}
      {badge ? <span className={`swipe-badge ${badge.className}`}>{badge.label}</span> : null}
      <div className="swipe-card-content">
        <div className="swipe-food-avatar" aria-hidden>
          <img src={food.image} alt="" className="swipe-food-avatar-image" draggable={false} />
        </div>
        <h2>{`I love eating ${food.name.toLowerCase()}`}</h2>
      </div>
    </motion.article>
  );
}
