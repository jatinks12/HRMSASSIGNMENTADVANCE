import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { FormattedMessage } from "react-intl";
import { useAuth } from "../../Context/AuthContext";

const Sidebar = () => {
  const {permissions} = useAuth();
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
    <div className={styles.sidebar}>
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
    </div>
  );
};

export default Sidebar;