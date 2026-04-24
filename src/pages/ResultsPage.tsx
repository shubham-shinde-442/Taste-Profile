import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { InfoListCard } from "../components/InfoListCard";
import { cuisines } from "../data/foodData";
import { useTasteProfile } from "../contexts/TasteProfileContext";
import type { Food } from "../types/food";

type HighlightItem = {
  icon: JSX.Element;
  label: string;
};

type HighlightSlide = {
  items: HighlightItem[];
};

interface SharedProfilePayload {
  v: 1;
  id: string;
  createdAt: number;
  category: Food["category"];
  cuisine: string;
  vibe: string;
  lifestyleGoals: string[];
  lovedList: string[];
}

const CATEGORY_META: Record<Food["category"], { icon: string; label: string }> = {
  protein: { icon: "🥩", label: "Protein Forward" },
  carb: { icon: "🍚", label: "Carb Friendly" },
  vegetable: { icon: "🥦", label: "Veggie First" },
  other: { icon: "🍽", label: "Mixed Plate" }
};

const TAG_ICON_MAP: Record<string, string> = {
  healthy: "🥗",
  comfort: "🍝",
  fruit: "🍇",
  seafood: "🦐",
  fish: "🐟",
  breakfast: "🍳",
  "plant based": "🌱",
  "whole grain": "🌾",
  salad: "🥗"
};

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

function topTags(foods: Food[]): string[] {
  const map = new Map<string, number>();

  foods.forEach((food) => {
    food.tags.forEach((tag) => {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    });
  });

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag.replace(/-/g, " "));
}

function toLabel(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function topCategory(foods: Food[]): Food["category"] | null {
  if (foods.length === 0) {
    return null;
  }

  const counts = new Map<Food["category"], number>();

  foods.forEach((food) => {
    counts.set(food.category, (counts.get(food.category) ?? 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function topCuisine(foods: Food[]): string | null {
  const cuisineNames = cuisines.map((item) => item.name.toLowerCase());
  const counts = new Map<string, number>();

  foods.forEach((food) => {
    food.tags.forEach((tag) => {
      const normalized = tag.toLowerCase();
      if (!cuisineNames.includes(normalized)) {
        return;
      }

      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return winner ? toLabel(winner) : null;
}

function topVibeTag(foods: Food[]): string | null {
  const blocked = new Set(["protein", "carb", "vegetable", ...cuisines.map((item) => item.name.toLowerCase())]);
  const counts = new Map<string, number>();

  foods.forEach((food) => {
    food.tags.forEach((tag) => {
      const normalized = tag.toLowerCase().replace(/-/g, " ");
      if (blocked.has(normalized)) {
        return;
      }

      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function cuisineIcon(cuisineName: string): JSX.Element {
  const normalized = cuisineName.toLowerCase();

  if (normalized === "italian") {
    return (
      <span className="cuisine-flag cuisine-flag-italian" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (normalized === "japanese") {
    return <span className="cuisine-flag cuisine-flag-japanese" aria-hidden />;
  }

  if (normalized === "mexican") {
    return (
      <span className="cuisine-flag cuisine-flag-mexican" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (normalized === "american") {
    return <span className="cuisine-flag cuisine-flag-american" aria-hidden />;
  }

  return <span aria-hidden>{cuisines.find((item) => item.name.toLowerCase() === normalized)?.emoji ?? "🌍"}</span>;
}

function chunkList<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function encodeSharePayload(payload: SharedProfilePayload): string {
  const utf8 = encodeURIComponent(JSON.stringify(payload));
  const base64 = btoa(utf8);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeSharePayload(value: string | null): SharedProfilePayload | null {
  if (!value) {
    return null;
  }

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const json = decodeURIComponent(atob(padded));
    const parsed = JSON.parse(json) as SharedProfilePayload;

    if (parsed.v !== 1 || !parsed.id || !Array.isArray(parsed.lifestyleGoals) || !Array.isArray(parsed.lovedList)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function createShareId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ResultsPage(): JSX.Element {
  const location = useLocation();
  const { likedFoods, superLikedFoods, dislikedFoods, resetProfile } = useTasteProfile();
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [lovedPageIndex, setLovedPageIndex] = useState(0);
  const [hatedPageIndex, setHatedPageIndex] = useState(0);
  const [cuisinesPageIndex, setCuisinesPageIndex] = useState(0);
  const [shareLabel, setShareLabel] = useState("Share");

  const lovedFoods = dedupe([...superLikedFoods, ...likedFoods].map((food) => food.name));
  const sharedPayload = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return decodeSharePayload(params.get("share"));
  }, [location.search]);

  const baseLifestyleGoals = useMemo(() => {
    const tags = topTags([...likedFoods, ...superLikedFoods]);
    return tags.length > 0 ? tags : ["Active", "Gym Goer", "Walks a lot", "PCOS and GI Diet"];
  }, [likedFoods, superLikedFoods]);

  const baseLovedList = lovedFoods.length > 0 ? lovedFoods.slice(0, 10) : ["Spinach", "Kale", "Avocado", "Quinoa"];
  const preferenceFoods = useMemo(() => [...superLikedFoods, ...likedFoods], [likedFoods, superLikedFoods]);

  const hatedList = useMemo(() => {
    const dataList = dedupe(dislikedFoods.map((food) => food.name));
    return dataList.length > 0 ? dataList.slice(0, 10) : ["Spinach", "Kale", "Avocado", "Quinoa", "Bread", "Potatoes"];
  }, [dislikedFoods]);

  const favoriteCuisines = useMemo(() => {
    const cuisineNames = cuisines.map((item) => item.name.toLowerCase());
    const counts = new Map<string, number>();

    preferenceFoods.forEach((food) => {
      food.tags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        if (!cuisineNames.includes(normalized)) {
          return;
        }

        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      });
    });

    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => toLabel(name));

    return top.length > 0 ? top : ["Italian", "Indian", "Mexican", "Lebanese"];
  }, [preferenceFoods]);

  const baseCategory = useMemo(() => topCategory(preferenceFoods) ?? "protein", [preferenceFoods]);
  const baseCuisine = useMemo(() => topCuisine(preferenceFoods) ?? "Italian", [preferenceFoods]);
  const baseVibe = useMemo(() => topVibeTag(preferenceFoods) ?? "fruit", [preferenceFoods]);

  const lifestyleGoals = sharedPayload?.lifestyleGoals?.length ? sharedPayload.lifestyleGoals : baseLifestyleGoals;
  const lovedList = sharedPayload?.lovedList?.length ? sharedPayload.lovedList : baseLovedList;
  const lovedPages = useMemo(() => chunkList(lovedList, 4), [lovedList]);
  const hatedPages = useMemo(() => chunkList(hatedList, 4), [hatedList]);
  const favoriteCuisinePages = useMemo(() => chunkList(favoriteCuisines, 4), [favoriteCuisines]);
  const canSwipeLoved = lovedList.length > 4;
  const canSwipeHated = hatedList.length > 4;
  const canSwipeCuisines = favoriteCuisines.length > 4;
  const highlightCategory = sharedPayload?.category ?? baseCategory;
  const highlightCuisine = sharedPayload?.cuisine ?? baseCuisine;
  const highlightVibe = sharedPayload?.vibe ?? baseVibe;

  const dataHighlights = useMemo<HighlightItem[]>(() => {
    const categoryMeta = CATEGORY_META[highlightCategory];
    const cuisineName = highlightCuisine;
    const vibeTag = highlightVibe;
    const vibeLabel = `${toLabel(vibeTag)} Lover`;

    return [
      {
        icon: <span aria-hidden>{categoryMeta.icon}</span>,
        label: categoryMeta.label
      },
      {
        icon: cuisineIcon(cuisineName),
        label: `${cuisineName} Food`
      },
      {
        icon: <span aria-hidden>{TAG_ICON_MAP[vibeTag] ?? "✨"}</span>,
        label: vibeLabel
      }
    ];
  }, [highlightCategory, highlightCuisine, highlightVibe]);

  const highlightSlides = useMemo<HighlightSlide[]>(
    () => [
      {
        items: dataHighlights
      },
      {
        items: [
          { icon: <span aria-hidden>💪</span>, label: lifestyleGoals[0] ?? "Active" },
          { icon: <span aria-hidden>🏃</span>, label: lifestyleGoals[1] ?? "Gym Goer" },
          { icon: <span aria-hidden>🚶</span>, label: lifestyleGoals[2] ?? "Walks a lot" }
        ]
      }
    ],
    [dataHighlights, lifestyleGoals]
  );

  const goToHighlight = (nextIndex: number): void => {
    if (nextIndex < 0 || nextIndex >= highlightSlides.length || nextIndex === highlightIndex) {
      return;
    }

    setHighlightIndex(nextIndex);
  };

  const handleHighlightSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }): void => {
    const threshold = 80;
    if (info.offset.x < -threshold) {
      goToHighlight(Math.min(highlightIndex + 1, highlightSlides.length - 1));
    }

    if (info.offset.x > threshold) {
      goToHighlight(Math.max(highlightIndex - 1, 0));
    }
  };

  useEffect(() => {
    setLovedPageIndex((current) => Math.min(current, Math.max(lovedPages.length - 1, 0)));
  }, [lovedPages.length]);

  useEffect(() => {
    setHatedPageIndex((current) => Math.min(current, Math.max(hatedPages.length - 1, 0)));
  }, [hatedPages.length]);

  useEffect(() => {
    setCuisinesPageIndex((current) => Math.min(current, Math.max(favoriteCuisinePages.length - 1, 0)));
  }, [favoriteCuisinePages.length]);

  const goToLovedPage = (nextIndex: number): void => {
    if (nextIndex < 0 || nextIndex >= lovedPages.length || nextIndex === lovedPageIndex) {
      return;
    }

    setLovedPageIndex(nextIndex);
  };

  const handleLovedSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }): void => {
    const threshold = 80;

    if (info.offset.x < -threshold) {
      goToLovedPage(Math.min(lovedPageIndex + 1, lovedPages.length - 1));
    }

    if (info.offset.x > threshold) {
      goToLovedPage(Math.max(lovedPageIndex - 1, 0));
    }
  };

  const goToHatedPage = (nextIndex: number): void => {
    if (nextIndex < 0 || nextIndex >= hatedPages.length || nextIndex === hatedPageIndex) {
      return;
    }

    setHatedPageIndex(nextIndex);
  };

  const handleHatedSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }): void => {
    const threshold = 80;

    if (info.offset.x < -threshold) {
      goToHatedPage(Math.min(hatedPageIndex + 1, hatedPages.length - 1));
    }

    if (info.offset.x > threshold) {
      goToHatedPage(Math.max(hatedPageIndex - 1, 0));
    }
  };

  const goToFavoriteCuisinePage = (nextIndex: number): void => {
    if (nextIndex < 0 || nextIndex >= favoriteCuisinePages.length || nextIndex === cuisinesPageIndex) {
      return;
    }

    setCuisinesPageIndex(nextIndex);
  };

  const handleFavoriteCuisineSwipe = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ): void => {
    const threshold = 80;

    if (info.offset.x < -threshold) {
      goToFavoriteCuisinePage(Math.min(cuisinesPageIndex + 1, favoriteCuisinePages.length - 1));
    }

    if (info.offset.x > threshold) {
      goToFavoriteCuisinePage(Math.max(cuisinesPageIndex - 1, 0));
    }
  };

  const handleShare = async (): Promise<void> => {
    const payload: SharedProfilePayload = {
      v: 1,
      id: createShareId(),
      createdAt: Date.now(),
      category: highlightCategory,
      cuisine: highlightCuisine,
      vibe: highlightVibe,
      lifestyleGoals: lifestyleGoals.slice(0, 4),
      lovedList: lovedList.slice(0, 12)
    };

    const url = new URL(window.location.href);
    url.pathname = "/results";
    url.search = "";
    url.searchParams.set("sid", payload.id);
    url.searchParams.set("share", encodeSharePayload(payload));

    const summary = `My taste profile: ${highlightSlides[0].items.map((item) => item.label).join(", ")}.`;
    const shareData: ShareData = {
      title: "CalorAI Taste Profile",
      text: summary,
      url: url.toString()
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareLabel("Shared");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setShareLabel("Copied");
      } else {
        setShareLabel("Unavailable");
      }
    } catch {
      setShareLabel("Share");
      return;
    }

    window.setTimeout(() => {
      setShareLabel("Share");
    }, 1600);
  };

  return (
    <section className="page results-page">
      <header className="page-title-block results-title-block">
        <h1>Your Taste Profile</h1>
        <p>Tailored to your unique needs. We'll use this for recommendations and meals plans</p>
      </header>

      <section className="results-section-label">Key Highlights:</section>

      <motion.article
        className="highlights-card results-highlights-card"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleHighlightSwipe}
        whileTap={{ cursor: "grabbing" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={highlightIndex}
            className="key-highlights-panel"
            initial={{ opacity: 0, x: highlightIndex === 0 ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: highlightIndex === 0 ? -30 : 30 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="key-highlights-grid">
              {highlightSlides[highlightIndex].items.map((item, index) => (
                <Fragment key={`${item.label}-${index}`}>
                  <div key={`${item.label}-${index}`} className="key-highlight-item">
                    <span className="key-highlight-emoji" aria-hidden>
                      {item.icon}
                    </span>
                    <span className="key-highlight-label">{item.label}</span>
                  </div>
                  {index < highlightSlides[highlightIndex].items.length - 1 ? (
                    <span key={`${item.label}-divider-${index}`} className="key-highlight-divider" aria-hidden>
                      |
                    </span>
                  ) : null}
                </Fragment>
              ))}
            </div>

            <div className="key-highlights-dots" role="tablist" aria-label="Key highlight pages">
              {highlightSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === highlightIndex ? "dot-active" : "dot-inactive"}
                  onClick={() => goToHighlight(index)}
                  aria-label={`Show highlight page ${index + 1}`}
                  aria-pressed={index === highlightIndex}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.article>

      <InfoListCard
        className="results-list-card goals-card"
        title="Lifestyle & Goals"
        titleIcon="💪"
        subtitle="We'll use this to tailor our advice & meal plan"
        items={lifestyleGoals}
        icon="✓"
        itemIconClassName="goal-badge"
      />

      <motion.article
        className="results-list-card loved-card loved-carousel-card"
        drag={canSwipeLoved ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={canSwipeLoved ? handleLovedSwipe : undefined}
        whileTap={canSwipeLoved ? { cursor: "grabbing" } : undefined}
      >
        <motion.div
          key={lovedPageIndex}
          className="loved-card-page"
          initial={{ opacity: 0.7, x: lovedPageIndex === 0 ? 18 : -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header>
            <h3>
              <span className="card-title-icon">❤️</span>
              Foods You Love
            </h3>
            <p>We'll Recommend These</p>
          </header>

          <ul>
            {(lovedPages[lovedPageIndex] ?? []).map((item, index) => (
              <li key={`${item}-${index}`}>
                <span className="info-item-badge love-badge">♥</span>
                <span className="info-item-text">{item}</span>
              </li>
            ))}
          </ul>

          {canSwipeLoved && lovedPages.length > 1 ? (
            <div className="card-page-dots" role="tablist" aria-label="Foods you love pages">
              {lovedPages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === lovedPageIndex ? "dot-active" : "dot-inactive"}
                  onClick={() => goToLovedPage(index)}
                  aria-label={`Show foods you love page ${index + 1}`}
                  aria-pressed={index === lovedPageIndex}
                />
              ))}
            </div>
          ) : null}
        </motion.div>
      </motion.article>

      <section className="results-secondary-grid">
        <motion.article
          className="results-list-card results-carousel-card"
          drag={canSwipeHated ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={canSwipeHated ? handleHatedSwipe : undefined}
          whileTap={canSwipeHated ? { cursor: "grabbing" } : undefined}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={hatedPageIndex}
              className="loved-card-page"
              initial={{ opacity: 0.7, x: hatedPageIndex === 0 ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <header>
                <h3>
                  <span className="card-title-icon">🙅</span>
                  Foods You Hate
                </h3>
                <p>These will never be on the menu</p>
              </header>

              <ul>
                {(hatedPages[hatedPageIndex] ?? []).map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <span className="info-item-badge love-badge">✓</span>
                    <span className="info-item-text">{item}</span>
                  </li>
                ))}
              </ul>

              {canSwipeHated && hatedPages.length > 1 ? (
                <div className="card-page-dots" role="tablist" aria-label="Foods you hate pages">
                  {hatedPages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={index === hatedPageIndex ? "dot-active" : "dot-inactive"}
                      onClick={() => goToHatedPage(index)}
                      aria-label={`Show foods you hate page ${index + 1}`}
                      aria-pressed={index === hatedPageIndex}
                    />
                  ))}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </motion.article>

        <motion.article
          className="results-list-card results-carousel-card"
          drag={canSwipeCuisines ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={canSwipeCuisines ? handleFavoriteCuisineSwipe : undefined}
          whileTap={canSwipeCuisines ? { cursor: "grabbing" } : undefined}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cuisinesPageIndex}
              className="loved-card-page"
              initial={{ opacity: 0.7, x: cuisinesPageIndex === 0 ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <header>
                <h3>
                  <span className="card-title-icon">👑</span>
                  Your Favorite Cuisines
                </h3>
                <p>Flavors you love, all in one place</p>
              </header>

              <ul>
                {(favoriteCuisinePages[cuisinesPageIndex] ?? []).map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <span className="info-item-badge love-badge">✓</span>
                    <span className="info-item-text">{item}</span>
                  </li>
                ))}
              </ul>

              {canSwipeCuisines && favoriteCuisinePages.length > 1 ? (
                <div className="card-page-dots" role="tablist" aria-label="Favorite cuisines pages">
                  {favoriteCuisinePages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={index === cuisinesPageIndex ? "dot-active" : "dot-inactive"}
                      onClick={() => goToFavoriteCuisinePage(index)}
                      aria-label={`Show favorite cuisines page ${index + 1}`}
                      aria-pressed={index === cuisinesPageIndex}
                    />
                  ))}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </motion.article>
      </section>

      <div className="results-actions">
        <Link className="cta-button results-retake" to="/swipe" onClick={resetProfile}>
          Retake Quizz
        </Link>
        <button className="results-share" type="button" onClick={handleShare}>
          {shareLabel}
        </button>
      </div>
    </section>
  );
}
