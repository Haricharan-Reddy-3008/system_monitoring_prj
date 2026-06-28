import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import HowToUse from "./pages/HowToUse";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/dashboard/:projectId" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-to-use" element={<HowToUse />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
