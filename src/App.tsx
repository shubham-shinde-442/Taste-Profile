import { Navigate, Route, Routes } from "react-router-dom";
import { AppFrame } from "./components/AppFrame";
import { IntroPage } from "./pages/IntroPage";
import { SwipePage } from "./pages/SwipePage";
import { ResultsPage } from "./pages/ResultsPage";

function App(): JSX.Element {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<Navigate to="/intro" replace />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </AppFrame>
  );
}

export default App;
