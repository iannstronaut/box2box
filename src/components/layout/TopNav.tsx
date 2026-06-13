import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { clsx } from "../../utils/id";
import b2bLight from "/b2b-light.png";
import b2bDark from "/b2b-dark.png";
import { ThemeToggle } from "../common/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { IconArrow, IconShield } from "../common/Icons";
import { useLocale } from "../../context/LocaleContext";
import { LocaleToggle } from "../common/LocaleToggle";

type NavItem =
  | { to: string; label: string }
  | { hash: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "nav.overview" },
  { to: "/workspace", label: "nav.workspace" },
  { hash: "features", label: "nav.features" },
  { hash: "formats", label: "nav.formats" },
  { to: "/docs", label: "nav.docs" },
];

export function TopNav() {
  const { resolved } = useTheme();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (hash: string) => {
    const scroll = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(scroll, 120);
    } else {
      scroll();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-canvas/75 backdrop-blur-glass border-b border-hairline">
      <div className="mx-auto max-w-[1320px] h-16 flex items-center gap-4 px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src={resolved === "dark" ? b2bDark : b2bLight}
            alt="Box2Box"
            className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
            draggable={false}
          />
          <span className="hidden sm:inline font-display font-semibold text-[15px] tracking-tight text-on-dark">
            Box2Box
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {NAV_ITEMS.map((item) =>
            "hash" in item ? (
              <button
                key={item.hash}
                type="button"
                onClick={() => goToSection(item.hash)}
                className="px-3 py-1.5 rounded-lg text-[14px] font-medium font-display transition-colors text-muted hover:text-on-dark hover:bg-[var(--tint-a)]"
              >
                {t(item.label)}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "px-3 py-1.5 rounded-lg text-[14px] font-medium font-display transition-colors",
                    isActive
                      ? "text-on-dark bg-[var(--tint-a)]"
                      : "text-muted hover:text-on-dark hover:bg-[var(--tint-a)]",
                  )
                }
              >
                {t(item.label)}
              </NavLink>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="hidden lg:inline-flex items-center gap-1.5 chip">
            <IconShield size={13} className="text-success" />
            {t("nav.localFirst")}
          </span>
          <LocaleToggle size="sm" />
          <ThemeToggle size="sm" />
          <button
            type="button"
            onClick={() => navigate("/workspace")}
            className="btn-primary btn-sm"
          >
            {t("nav.openStudio")}
            <IconArrow size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
