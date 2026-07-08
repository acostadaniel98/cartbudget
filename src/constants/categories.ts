import type { Category } from "@/domain/models/category";


export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-lacteos", nombre: "Lácteos", icono: "Milk", color: "#3B82F6", personalizada: false, orden: 0 },
  { id: "cat-carnes", nombre: "Carnes", icono: "Beef", color: "#DC2626", personalizada: false, orden: 1 },
  { id: "cat-frutas", nombre: "Frutas", icono: "Apple", color: "#F59E0B", personalizada: false, orden: 2 },
  { id: "cat-verduras", nombre: "Verduras", icono: "Carrot", color: "#16A34A", personalizada: false, orden: 3 },
  { id: "cat-panaderia", nombre: "Panadería", icono: "Croissant", color: "#B45309", personalizada: false, orden: 4 },
  { id: "cat-bebidas", nombre: "Bebidas", icono: "CupSoda", color: "#0EA5E9", personalizada: false, orden: 5 },
  { id: "cat-limpieza", nombre: "Limpieza", icono: "SprayCan", color: "#8B5CF6", personalizada: false, orden: 6 },
  { id: "cat-mascotas", nombre: "Mascotas", icono: "PawPrint", color: "#EA580C", personalizada: false, orden: 7 },
  { id: "cat-congelados", nombre: "Congelados", icono: "Snowflake", color: "#0891B2", personalizada: false, orden: 8 },
  { id: "cat-higiene", nombre: "Higiene", icono: "Sparkles", color: "#DB2777", personalizada: false, orden: 9 },
  { id: "cat-abarrotes", nombre: "Abarrotes", icono: "Package", color: "#65A30D", personalizada: false, orden: 10 },
  { id: "cat-otros", nombre: "Otros", icono: "ShoppingBasket", color: "#6B7280", personalizada: false, orden: 11 },
];

export const UNCATEGORIZED_ID = "cat-otros";

