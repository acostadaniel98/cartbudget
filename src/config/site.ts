import { ROUTES } from "@/constants/routes";

export const SITE_CONFIG = {
  nombre: "AntBudget",
  descripcion:
    "AntBudget te ayuda a organizar tu compra del supermercado, controlar el presupuesto y ahorrar tiempo con listas inteligentes y seguimiento visual.",
  locale: "es-SV",
  moneda: "USD",
  url: "https://antbudget.com",
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
