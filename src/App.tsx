import { BrowserRouter as Router } from "react-router-dom";
import RoutesApp from "./RoutesApp";
import { AuthProvider } from "./utils/AuthContext";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <RoutesApp />
      </Router>
    </AuthProvider>
  );
}

export default App;
