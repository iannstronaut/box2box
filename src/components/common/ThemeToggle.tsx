import { IconSun, IconMoon, IconMonitor } from "../common/Icons";
import { useTheme } from "../../context/ThemeContext";
import { clsx } from "../../utils/id";
import type { ThemeMode } from "../../context/ThemeContext";

export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { mode, setMode } = useTheme();
  const opts: { id: ThemeMode; label: string; Icon: typeof IconSun }[] = [
    { id: "system", label: "System", Icon: IconMonitor },
    { id: "light", label: "Light", Icon: IconSun },
    { id: "dark", label: "Dark", Icon: IconMoon },
  ];

  if (size === "sm") {
    return (
      <div className="flex items-center glass-soft p-0.5">
        {opts.map((o) => {
          const active = mode === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setMode(o.id)}
              title={o.label}
              className={clsx(
                "w-7 h-7 flex items-center justify-center transition-colors",
                active
                  ? "bg-[var(--on-dark)] text-[var(--canvas)]"
                  : "text-[var(--body)] hover:text-[var(--on-dark)]",
              )}
            >
              <o.Icon size={12} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center glass-soft p-1">
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setMode(o.id)}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 h-7 transition-colors type-label",
              active
                ? "bg-[var(--on-dark)] text-[var(--canvas)]"
                : "text-[var(--body)] hover:text-[var(--on-dark)]",
            )}
          >
            <o.Icon size={12} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
