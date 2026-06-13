import { clsx } from "../../utils/id";

type Variant = "primary" | "outline" | "ghost" | "danger";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  soft?: boolean;
  tile?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Elevated, rounded surface. Radius + shadow come from the glass/* classes
 * defined in index.css so cards feel soft and modern by default.
 */
export function GlassCard({
  children,
  className,
  strong,
  soft,
  tile,
  as: As = "div",
}: GlassCardProps) {
  const variant = strong
    ? "glass-strong"
    : soft
      ? "glass-soft"
      : tile
        ? "glass-tile"
        : "glass";
  return <As className={clsx(variant, className)}>{children}</As>;
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "sm";
  iconOnly?: boolean;
}

export function Button({
  variant = "outline",
  size = "md",
  iconOnly,
  className,
  children,
  ...rest
}: BtnProps) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "outline"
        ? "btn-outline"
        : variant === "danger"
          ? "btn-danger"
          : "btn-ghost";
  const sizeCls = size === "sm" ? "btn-sm" : "";
  if (iconOnly) {
    return (
      <button
        type="button"
        className={clsx(size === "sm" ? "btn-icon-sm" : "btn-icon", className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
  return (
    <button type="button" className={clsx(base, sizeCls, className)} {...rest}>
      {children}
    </button>
  );
}

/** A small uppercase eyebrow label used above section titles. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx("type-eyebrow inline-flex items-center gap-2", className)}>
      <span className="w-4 h-px bg-accent inline-block" />
      {children}
    </span>
  );
}
