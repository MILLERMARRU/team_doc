// ============================================================
//  lib/utils.ts  –  utilidades generales
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind de forma segura */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
