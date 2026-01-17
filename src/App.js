
import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import MainScreen from "./components/main/mainScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
