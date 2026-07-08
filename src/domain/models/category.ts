
export interface Category {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  personalizada: boolean;
  orden: number;
}

export interface CreateCategoryInput {
  nombre: string;
  icono?: string;
  color?: string;
}
