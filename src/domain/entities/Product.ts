/**
 * Entity: Product
 * Representa un producto en el carrito
 */

import { Money } from '../value-objects/Money';

export interface ProductProps {
  id: string;
  name: string;
  price: Money;
  quantity: number;
}

export class Product {
  private readonly id: string;
  private readonly name: string;
  private readonly price: Money;
  private quantity: number;

  constructor(props: ProductProps) {
    this.validateProduct(props);
    this.id = props.id;
    this.name = props.name;
    this.price = props.price;
    this.quantity = props.quantity;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): Money {
    return this.price;
  }

  getQuantity(): number {
    return this.quantity;
  }

  /**
   * Actualizar la cantidad de producto
   */
  updateQuantity(newQuantity: number): void {
    if (newQuantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    this.quantity = newQuantity;
  }

  /**
   * Calcular el total para este producto
   */
  getTotal(): Money {
    return this.price.multiply(this.quantity);
  }

  /**
   * Crear un objeto plano para serialización
   */
  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      price: this.price.getRawValue(),
      quantity: this.quantity,
    };
  }

  /**
   * Deserializar desde objeto plano
   */
  static fromPlainObject(obj: any): Product {
    return new Product({
      id: obj.id,
      name: obj.name,
      price: Money.fromCents(obj.price),
      quantity: obj.quantity,
    });
  }

  private validateProduct(props: ProductProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('El producto debe tener un ID válido');
    }
    if (!props.name || props.name.trim() === '') {
      throw new Error('El producto debe tener un nombre');
    }
    if (props.quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
  }
}
