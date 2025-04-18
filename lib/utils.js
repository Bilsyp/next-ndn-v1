import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatInt(n) {
  return Number.isNaN(n) ? "?" : `${Math.round(n)}`;
}