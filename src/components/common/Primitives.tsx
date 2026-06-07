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
  return (
    <As className={clsx(variant, "rounded-none", className)}>{children}</As>
  );
}

interface BtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        className={clsx("btn-icon", className)}
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
