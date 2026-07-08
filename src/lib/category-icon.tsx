import type { ComponentType, SVGProps } from "react";
import * as LucideIcons from "lucide-react";
import { ShoppingBasket } from "lucide-react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

/**
 * Las categorías guardan únicamente el nombre del ícono de lucide-react
 * (ej. "Milk"). Esta función lo resuelve a un componente real, con un
 * ícono de respaldo por si el nombre no existe (categoría personalizada
 * antigua, error de tipeo, etc.).
 */
export function getCategoryIcon(iconName: string): IconComponent {
  const icons = LucideIcons as unknown as Record<string, IconComponent>;
  return icons[iconName] ?? ShoppingBasket;
}
