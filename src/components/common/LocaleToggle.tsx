import { useLocale } from "../../context/LocaleContext";
import { clsx } from "../../utils/id";
import type { Locale } from "../../i18n/translations";

/**
 * Compact segmented language control: EN (US) / ID (Bahasa Indonesia).
 * Mirrors the look of ThemeToggle so the two controls sit nicely together.
 */
export function LocaleToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { locale, setLocale } = useLocale();
  const opts: { id: Locale; label: string; title: string }[] = [
    { id: "en", label: "EN", title: "English (US)" },
    { id: "id", label: "ID", title: "Bahasa Indonesia" },
  ];
  const sm = size === "sm";

  return (
    <div
      className="inline-flex items-center gap-0.5 p-1 rounded-full glass-soft"
      role="radiogroup"
      aria-label="Language"
    >
      {opts.map((o) => {
        const active = locale === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(o.id)}
            title={o.title}
            className={clsx(
              "flex items-center justify-center rounded-full transition-all duration-150 font-display font-semibold tracking-wide",
              sm ? "h-7 px-2.5 text-[11.5px]" : "h-8 px-3 text-[12.5px]",
              active
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-on-dark",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
