import { ROUTES } from "@/constants/routes";

export const SITE_CONFIG = {
  nombre: "CartBudget",
  descripcion:
    "Acompaña tu compra de supermercado: agrega productos, controla cuánto te queda y termina más rápido.",
  locale: "es-SV",
  moneda: "USD",
} as const;

export interface NavItem {
  label: string;
  href: string;
  icon: "Home" | "History" | "LayoutTemplate" | "BarChart3";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: ROUTES.inicio, icon: "Home" },
  { label: "Historial", href: ROUTES.historial, icon: "History" },
  { label: "Plantillas", href: ROUTES.plantillas, icon: "LayoutTemplate" },
  { label: "Estadísticas", href: ROUTES.estadisticas, icon: "BarChart3" },
];
