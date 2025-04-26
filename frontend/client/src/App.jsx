import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProgressUpdatesPage from "./pages/ProgressUpdatesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PlanSharingPage from "./pages/PlanSharingPage";
import ErrorPage from "./pages/ErrorPage";
import OauthSuccess from "./pages/OauthSuccess";
import SkillInsightsPage from "./pages/SkillInsightsPage"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/oauth-success" element={<OauthSuccess />} />
        <Route path="/skill-insights" element={<SkillInsightsPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/progress-updates" element={<ProgressUpdatesPage />} />
          <Route path="/plan-sharing" element={<PlanSharingPage />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;