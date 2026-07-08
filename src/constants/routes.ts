export const ROUTES = {
  inicio: "/",
  nuevaCompra: "/nueva-compra",
  compra: (id: string) => `/compra/${id}`,
  historial: "/historial",
  plantillas: "/plantillas",
  estadisticas: "/estadisticas",
} as const;
