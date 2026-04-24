import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TasteProfileProvider, useTasteProfile } from "./contexts/TasteProfileContext";

interface SharedProfilePayload {
  v: 1;
  id: string;
  createdAt: number;
  category: "protein" | "carb" | "vegetable" | "other";
  cuisine: string;
  vibe: string;
  lifestyleGoals: string[];
  lovedList: string[];
}

function renderApp(initialEntries: string[]): void {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <TasteProfileProvider>
          <App />
        </TasteProfileProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function encodeSharePayload(payload: SharedProfilePayload): string {
  const utf8 = encodeURIComponent(JSON.stringify(payload));
  const base64 = btoa(utf8);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function TasteProfileProbe(): JSX.Element {
  const { currentIndex, dislikedFoods, reactToFood } = useTasteProfile();

  return (
    <div>
      <button type="button" onClick={() => reactToFood("left")}>
        Dislike current food
      </button>
      <span>{`Current index: ${currentIndex}`}</span>
      <span>{`Disliked foods: ${dislikedFoods.length}`}</span>
    </div>
  );
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects the root route to intro when there is no shared payload", () => {
    renderApp(["/"]);

    expect(screen.getByRole("heading", { name: /design your food plan/i })).toBeInTheDocument();
  });

  it("renders intro page heading", () => {
    renderApp(["/intro"]);

    expect(screen.getByRole("heading", { name: /design your food plan/i })).toBeInTheDocument();
  });

  it("redirects shared links from root to the results page", () => {
    renderApp(["/?share=demo-payload"]);

    expect(screen.getByRole("heading", { name: /your taste profile/i })).toBeInTheDocument();
  });

  it("persists the selected theme", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(window.localStorage.getItem("calorai-theme")).toBe(JSON.stringify("light"));
  });

  it("records a left swipe as a dislike", async () => {
    const user = userEvent.setup();

    render(
      <TasteProfileProvider>
        <TasteProfileProbe />
      </TasteProfileProvider>
    );

    await user.click(screen.getByRole("button", { name: /dislike current food/i }));

    expect(screen.getByText("Current index: 1")).toBeInTheDocument();
    expect(screen.getByText("Disliked foods: 1")).toBeInTheDocument();
  });

  it("supports keyboard navigation on the swipe screen", async () => {
    const user = userEvent.setup();

    renderApp(["/swipe"]);

    expect(screen.getByRole("heading", { name: /i love eating grilled salmon/i })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /i love eating chicken breast/i })).toBeInTheDocument();
    });
  });

  it("renders shared payload data on the results page", () => {
    const payload: SharedProfilePayload = {
      v: 1,
      id: "shared-demo",
      createdAt: Date.now(),
      category: "vegetable",
      cuisine: "Japanese",
      vibe: "healthy",
      lifestyleGoals: ["Runner Friendly", "High Fiber", "Quick Prep", "Weeknight Ready"],
      lovedList: ["Dragonfruit Bowl", "Miso Eggplant", "Tofu Poke"]
    };

    renderApp([`/results?share=${encodeSharePayload(payload)}`]);

    expect(screen.getByText("Dragonfruit Bowl")).toBeInTheDocument();
    expect(screen.getByText("Runner Friendly")).toBeInTheDocument();
    expect(screen.getByText("Japanese Food")).toBeInTheDocument();
  });

  it("copies a root-based share link in the clipboard fallback flow", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined
    });

    window.history.replaceState({}, "", "/results");

    renderApp(["/results"]);

    await user.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });

    const copiedValue = writeText.mock.calls[0][0] as string;
    const copiedUrl = new URL(copiedValue);

    expect(copiedUrl.origin).toMatch(/^http:\/\/localhost(?::\d+)?$/);
    expect(copiedUrl.pathname).toBe("/");
    expect(copiedUrl.searchParams.get("sid")).toBeTruthy();
    expect(copiedUrl.searchParams.get("share")).toBeTruthy();
    expect(copiedValue).not.toContain("My taste profile:");
  });
});
