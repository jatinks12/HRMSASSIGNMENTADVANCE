import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { FormattedMessage } from "react-intl";
import { useAuth } from "../../Context/AuthContext";

import { FiHome, FiCalendar, FiSettings } from "react-icons/fi";


interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  labelId: string;
  isActive?: boolean;
  tooltip: string;
}

const NavItem = ({ to, icon, labelId, isActive, tooltip }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive: routerActive }) =>
        [styles.navLink, (isActive ?? routerActive) ? styles.active : ""]
          .join(" ")
          .trim()
      }
      data-tooltip={tooltip}
      aria-label={tooltip}
    >
      <span className={styles.iconWrap}>{icon}</span>
      <span className={styles.label}>
        <FormattedMessage id={labelId} />
      </span>
      <span className={styles.activeBar} />
    </NavLink>
  );
};

const Sidebar = () => {
  const { permissions } = useAuth();
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
    <aside className={styles.sidebar}>
        <div className={styles.logoMark}>
        <span className={styles.logoIcon} ><div className={styles.logo}>HRMS</div></span>
      </div>
      <nav className={styles.nav}>
        {permissions.dashboard && (
          <NavItem
            to="/dashboard"
            icon={<FiHome />}
            labelId="nav.dashboard"
            tooltip="Dashboard"
          />
        )}

        <NavItem
          to="/leave"
          icon={<FiCalendar />}
          labelId="nav.leave"
          tooltip="Leave"
          isActive={isLeaveActive()}
        />

        {permissions.management && (
          <NavItem
            to="/management"
            icon={<FiSettings />}
            labelId="nav.management"
            tooltip="Management"
          />
        )}
      </nav>
      <div className={styles.bottomSection}>
        <div className={styles.divider} />
        <div className={styles.userAvatar} aria-hidden="true">
          <span className={styles.avatarInitials}>U</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
