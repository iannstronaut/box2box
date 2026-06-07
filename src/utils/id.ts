import type { ClassDef } from "../types";

const DEFAULT_PALETTE = [
  "#1c69d4",
  "#e22718",
  "#0066b1",
  "#f4b400",
  "#0fa336",
  "#e85aad",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#ecf0f1",
  "#34495e",
  "#16a085",
];

export function pickClassColor(index: number, existing: ClassDef[]): string {
  const used = new Set(existing.map((c) => c.color.toLowerCase()));
  for (const c of DEFAULT_PALETTE) {
    if (!used.has(c.toLowerCase())) return c;
  }
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function clsx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
