import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppFrame } from "./components/AppFrame";
import { IntroPage } from "./pages/IntroPage";
import { SwipePage } from "./pages/SwipePage";
import { ResultsPage } from "./pages/ResultsPage";

function RootRedirect(): JSX.Element {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const target = params.has("share") ? `/results${location.search}` : "/intro";

  return <Navigate to={target} replace />;
}

function App(): JSX.Element {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </AppFrame>
  );
}

export default App;
