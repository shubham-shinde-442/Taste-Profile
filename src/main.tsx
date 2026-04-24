import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TasteProfileProvider } from "./contexts/TasteProfileContext";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <TasteProfileProvider>
          <App />
        </TasteProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
