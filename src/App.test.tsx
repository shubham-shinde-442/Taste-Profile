import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TasteProfileProvider } from "./contexts/TasteProfileContext";

describe("App", () => {
  it("renders intro page heading", () => {
    render(
      <MemoryRouter initialEntries={["/intro"]}>
        <ThemeProvider>
          <TasteProfileProvider>
            <App />
          </TasteProfileProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /design your food plan/i })).toBeInTheDocument();
  });
});
