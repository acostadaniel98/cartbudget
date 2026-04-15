/**
 * Value Object: Money
 * Encapsula la lógica de manejo de dinero en USD con precisión decimal
 */

export class Money {
  private readonly cents: number;

  constructor(dollars: number) {
    // Convertir a centavos para evitar errores de punto flotante
    this.cents = Math.round(dollars * 100);
  }

  /**
   * Obtener el valor en dólares
   */
  toDollars(): number {
    return this.cents / 100;
  }

  /**
   * Sumar dos cantidades de dinero
   */
  add(other: Money): Money {
    return new Money((this.cents + other.cents) / 100);
  }

  /**
   * Restar dos cantidades de dinero
   */
  subtract(other: Money): Money {
    return new Money((this.cents - other.cents) / 100);
  }

  /**
   * Multiplicar por un número
   */
  multiply(factor: number): Money {
    return new Money((this.cents * factor) / 100);
  }

  /**
   * Comparar si es mayor que otra cantidad
   */
  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  /**
   * Comparar si es mayor o igual que otra cantidad
   */
  isGreaterThanOrEqual(other: Money): boolean {
    return this.cents >= other.cents;
  }

  /**
   * Comparar si es menor que otra cantidad
   */
  isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  /**
   * Comparar igualdad
   */
  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  /**
   * Formatear como moneda USD
   */
  format(): string {
    return `$${(this.cents / 100).toFixed(2)}`;
  }

  /**
   * Obtener el valor bruto en centavos (para almacenamiento)
   */
  getRawValue(): number {
    return this.cents;
  }

  /**
   * Crear desde centavos (útil para deserialización)
   */
  static fromCents(cents: number): Money {
    const money = new Money(0);
    (money as any).cents = cents;
    return money;
  }
}
