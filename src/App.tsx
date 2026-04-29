import {
  NavLink,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./App.css";

// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";
import { FormattedMessage, IntlProvider } from "react-intl";
import en from "./languages/messages/en.json";
import ja from "./languages/messages/ja.json";
import HrmsRoutes from "./Components/Router/HrmsRoutes";

const messages = {
  en,
  ja,
};

type Locale = "en" | "ja";

const App = () => {
  const { isAuth, user, permissions, logout } = useAuth();
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
                <span className="toggle-thumb"  />
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

      <HrmsRoutes/>
      
    </IntlProvider>
  );
};

export default App;
