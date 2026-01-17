
import "./App.css";
import {
  HashRouter,
  Route,
  Routes
} from "react-router-dom";
import MainScreen from "./components/main/mainScreen";
import VConsole from 'vconsole';

function App() {
  new VConsole();
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<MainScreen />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
