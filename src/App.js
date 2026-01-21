
import "./App.css";
import {
  HashRouter,
  Route,
  Routes
} from "react-router-dom";
import MainScreen from "./components/main/mainScreen";
import DetectingDevtools from "./components/detecting";

// import VConsole from "vconsole";

function App() {
  // VConsole && new VConsole();

  DetectingDevtools();

  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<MainScreen />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
