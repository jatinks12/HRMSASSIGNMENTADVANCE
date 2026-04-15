import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute, PublicRoute } from "./Helper/ProtectedRoute";
import "./App.css";
import SignUp from "./Components/Authentication/SignUp";
import Login from "./Components/Authentication/Login";

import Leave from "./Components/leave/Leave";
import ShowForm from "./Components/leave/ShowForm";
import ApproveLeave from "./Components/leave/ApproveLeave";
import ShowTable from "./Components/leave/ShowTable";
import Dashboard from "./Components/Dashboard/Dashboard";
import Management from "./Components/Mangement/Management";
import PageLoader from "./Components/UI/PageLoader";

const App = () => {
  const { isAuth, permissions, loading, logout } = useAuth();
  const location = useLocation();

  const hideheaderRoutes = ["/login"];
  const shouldHideHeader = hideheaderRoutes.includes(
    location.pathname.toLowerCase(),
  );
  return (
    <>
      {!shouldHideHeader && isAuth && (
        <header className="header">
          <div className="logo">HRMS</div>
          <nav className="nav">
            {permissions.dashboard && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/leave"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Leave
            </NavLink>
            {permissions.management && (
              <NavLink
                to="/management"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                Management
              </NavLink>
            )}
          </nav>
          <button style={{ backgroundColor: "red" }} onClick={logout}>
            Logout
          </button>
        </header>
      )}
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <PageLoader/>
            ) : !isAuth ? (
              <Navigate to="/login" replace />
            ) : permissions.dashboard ? (
              <Navigate to="/dashboard" replace />
            ) : permissions.management ? (
              <Navigate to="/management" replace />
            ) : (
              <Navigate to="/leave" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute allowed={permissions.management}>
              <SignUp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowed={permissions.dashboard}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute allowed={true}>
              <Leave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applyleave"
          element={
            <ProtectedRoute allowed={permissions.applyLeave}>
              <ShowForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approveleave"
          element={
            <ProtectedRoute allowed={permissions.approveLeave}>
              <ApproveLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leavetable"
          element={
            <ProtectedRoute allowed={permissions.leaveTable}>
              <ShowTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management"
          element={
            <ProtectedRoute allowed={permissions.management}>
              <Management />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
