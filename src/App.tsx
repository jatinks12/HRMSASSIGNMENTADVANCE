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
import en from "./languages/messages/en.json"
import ja from "./languages/messages/ja.json"

const messages={
 en,
 ja,
}

type Locale ="en"|"ja";

const App = () => {
  const { isAuth, user, permissions, loading, logout } = useAuth();
  const location = useLocation();
  const [loacle , setLocale] = useState<Locale>("en");

  const hideheaderRoutes = ["/login"];
  const shouldHideHeader = hideheaderRoutes.includes(
    location.pathname.toLowerCase(),
  );
  return (
    <IntlProvider locale={loacle} messages={messages[loacle]}>
      {!shouldHideHeader && isAuth && (
        <header className="header">
          <div className="logo">HRMS-- {user?.email} -- {user?.name} </div>
          <nav className="nav">
            {permissions.dashboard && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <FormattedMessage id="nav.dashboard"/>
              </NavLink>
            )}
            <NavLink
              to="/leave"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              <FormattedMessage id="nav.leave"/>
            </NavLink>
            {permissions.management && (
              <NavLink
                to="/management"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <FormattedMessage id="nav.management"/>
              </NavLink>
            )}
          </nav>
          <button className="language-btn" onClick={()=>setLocale(loacle ==="en"?"ja":"en")}> <FormattedMessage id="btn.language"/></button>
          <button className="logout-btn" onClick={logout}>
            <FormattedMessage id="btn.logout"/>
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
    </IntlProvider>
  );
};

export default App;
