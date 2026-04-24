import clsx from "clsx";
import { NavLink } from "react-router-dom";

interface BottomNavProps {
  currentPath: string;
}

const items = [
  { to: "/intro", icon: "🏠", label: "Start" },
  { to: "/swipe", icon: "✨", label: "Swipe" },
  { to: "/results", icon: "🧠", label: "Taste Profile" }
];

export function BottomNav({ currentPath }: BottomNavProps): JSX.Element {
  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            clsx("nav-item", (isActive || currentPath === item.to) && "nav-item-active")
          }
        >
          <span aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button className="nav-search" type="button" aria-label="Search placeholder">
        🔍
      </button>
    </nav>
  );
}
