import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { FormattedMessage } from "react-intl";
import type { Dispatch, SetStateAction } from "react";
import type { Locale } from "../../App";
import styles from "./Header.module.css";

interface Props {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
}

const Header = ({ locale, setLocale }: Props) => {
  const { user, permissions, logout } = useAuth();
  const location = useLocation();

  const isLeaveActive = () => {
    const path = location.pathname.toLowerCase();
    return (
      path.startsWith("/leave") ||
      path === "/applyleave" ||
      path === "/approveleave" ||
      path === "/leavetable"
    );
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>HRMS</div>

        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
      </div>

  
      <nav className={styles.navContainer}>
        {permissions.dashboard && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.active}`
                : styles.navLink
            }
          >
            <FormattedMessage id="nav.dashboard" />
          </NavLink>
        )}

        <NavLink
          to="/leave"
          className={() =>
            isLeaveActive()
              ? `${styles.navLink} ${styles.active}`
              : styles.navLink
          }
        >
          <FormattedMessage id="nav.leave" />
        </NavLink>

        {permissions.management && (
          <NavLink
            to="/management"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.active}`
                : styles.navLink
            }
          >
            <FormattedMessage id="nav.management" />
          </NavLink>
        )}
      </nav>

     
      <div className={styles.right}>
      
        <label className={styles.languageToggle}>
          <span>EN</span>

          <span className={styles.toggleTrack}>
            <input
              type="checkbox"
              checked={locale === "ja"}
              onChange={() =>
                setLocale(locale === "en" ? "ja" : "en")
              }
            />
            <span className={styles.toggleThumb} />
          </span>

          <span>JA</span>
        </label>

        
        <button
          className={styles.logoutBtnFull}
          onClick={logout}
        >
          <FormattedMessage id="btn.logout" />
        </button>
      </div>
    </header>
  );
};

export default Header;