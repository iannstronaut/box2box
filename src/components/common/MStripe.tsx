interface MStripeProps {
  className?: string;
  vertical?: boolean;
}

export function MStripe({ className = "", vertical = false }: MStripeProps) {
  return (
    <div
      className={`${vertical ? "m-stripe-vertical" : "m-stripe"} ${className}`}
      aria-hidden
    />
  );
}
