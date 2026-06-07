import { Link, NavLink } from "react-router-dom";
import { clsx } from "../../utils/id";
import b2bLight from "/b2b-light.png";
import b2bDark from "/b2b-dark.png";
import { ThemeToggle } from "../common/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

export function TopNav() {
  const { resolved } = useTheme();
  return (
    <header className="sticky top-0 z-30 bg-canvas/70 backdrop-blur-glass border-b border-hairline">
      <div className="m-stripe" />
      <div className="mx-auto max-w-[1440px] h-16 flex items-center px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={resolved === "dark" ? b2bLight : b2bDark}
            alt="Box2Box"
            className="h-9 w-9 object-contain"
            draggable={false}
          />
          <span className="hidden sm:inline type-label text-on-dark tracking-[0.18em]">
            BOX2BOX
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 ml-12">
          {[
            { to: "/", label: "Overview" },
            { to: "/workspace", label: "Workspace" },
            { to: "/#features", label: "Features" },
            { to: "/#formats", label: "Formats" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "type-nav transition-colors",
                  isActive ? "text-on-dark" : "text-body hover:text-on-dark",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden lg:inline-flex items-center gap-2 text-caption text-muted">
            <span className="w-1.5 h-1.5 bg-m-blue-light" />
            LOCAL-FIRST · NO CLOUD
          </span>
          <ThemeToggle size="sm" />
        </div>
      </div>
    </header>
  );
}
