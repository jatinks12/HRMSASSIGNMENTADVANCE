import {
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
import { useState } from "react";
import { FormattedMessage, IntlProvider } from "react-intl";
import en from "./languages/messages/en.json";
import ja from "./languages/messages/ja.json";

const messages = {
  en,
  ja,
};

type Locale = "en" | "ja";

const App = () => {
  const { isAuth, user, permissions, loading, logout } = useAuth();
  const location = useLocation();
  const [loacle, setLocale] = useState<Locale>("en");

  const hideheaderRoutes = ["/login"];
  const shouldHideHeader = hideheaderRoutes.includes(
    location.pathname.toLowerCase(),
  );
  return (
    <IntlProvider locale={loacle} messages={messages[loacle]}>
      {!shouldHideHeader && isAuth && (
        <header className="header">
          <div className="left">
            <div className="logo">HRMS</div>
            <div className="userInfo">
              <span className="userName">{user?.name}</span>
              <span className="userEmail">{user?.email}</span>
            </div>
          </div>
          <nav className="navContainer">
            {permissions.dashboard && (
              <NavLink to="/dashboard" className="navLink">
                <FormattedMessage id="nav.dashboard" />
              </NavLink>
            )}
            <NavLink
              to="/leave"
              className={() => {
                const path = location.pathname.toLowerCase();

                const isLeaveActive =
                  path.startsWith("/leave") ||
                  path === "/applyleave" ||
                  path === "/approveleave" ||
                  path === "/leavetable";

                return isLeaveActive ? "navLink active" : "navLink";
              }}
            >
              <FormattedMessage id="nav.leave" />
            </NavLink>
            {permissions.management && (
              <NavLink to="/management" className="navLink">
                <FormattedMessage id="nav.management" />
              </NavLink>
            )}
          </nav>
          <div className="right">
            <label className="language-toggle">
              <span>EN</span>
              <span className="toggle-track">
                <input
                  type="checkbox"
                  checked={loacle === "ja"}
                  onChange={() => setLocale(loacle === "en" ? "ja" : "en")}
                />
                <span className="toggle-thumb" />
              </span>
              <span>JA</span>
            </label>

            <button className="logoutBtnFull" onClick={logout}>
              <FormattedMessage id="btn.logout" />
            </button>
          </div>
        </header>
      )}
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <PageLoader />
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
    </IntlProvider>
  );
};

export default App;
