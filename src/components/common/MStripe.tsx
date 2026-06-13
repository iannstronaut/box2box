interface AccentBarProps {
  className?: string;
  vertical?: boolean;
}

/**
 * Slim brand accent bar (blue → cyan → rose gradient).
 * Kept named MStripe for backwards compatibility with existing imports.
 */
export function MStripe({ className = "", vertical = false }: AccentBarProps) {
  return (
    <div
      className={`${vertical ? "m-stripe-vertical" : "m-stripe"} rounded-full ${className}`}
      aria-hidden
    />
  );
}

export const AccentBar = MStripe;
