
import "./App.css";
import {
  HashRouter,
  Route,
  Routes
} from "react-router-dom";
import MainScreen from "./components/Main/MainScreen";
import { CURRENT_ENV } from "./utills/constants";
import { useEffect } from "react";

function App() {

  useEffect(() => {
    document.title = `ระบบตรวจสอบสลิป (v${CURRENT_ENV.VERSION})`;
  }, []);

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="*" element={<MainScreen />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
