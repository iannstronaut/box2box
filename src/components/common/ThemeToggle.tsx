import { IconSun, IconMoon, IconMonitor } from "../common/Icons";
import { useTheme } from "../../context/ThemeContext";
import { clsx } from "../../utils/id";
import type { ThemeMode } from "../../context/ThemeContext";

/**
 * Segmented theme control: System / Light / Dark.
 * Default mode is "system", which follows the OS preference.
 */
export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { mode, setMode } = useTheme();
  const opts: { id: ThemeMode; label: string; Icon: typeof IconSun }[] = [
    { id: "system", label: "System", Icon: IconMonitor },
    { id: "light", label: "Light", Icon: IconSun },
    { id: "dark", label: "Dark", Icon: IconMoon },
  ];

  const sm = size === "sm";

  return (
    <div
      className="inline-flex items-center gap-0.5 p-1 rounded-full glass-soft"
      role="radiogroup"
      aria-label="Color theme"
    >
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(o.id)}
            title={`${o.label} theme`}
            className={clsx(
              "flex items-center justify-center rounded-full transition-all duration-150",
              sm ? "h-7 px-2 gap-1" : "h-8 px-3 gap-1.5",
              active
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-on-dark",
            )}
          >
            <o.Icon size={sm ? 13 : 14} />
            {!sm && (
              <span className="text-[12.5px] font-medium font-display">
                {o.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
