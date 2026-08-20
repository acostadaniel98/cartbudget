"use client";

import * as React from "react";
import { Calculator, Delete, Divide, Equal, Grip, Minus, Percent, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Operator = "+" | "-" | "×" | "÷";
type Position = { left: number; top: number };

const POSITION_STORAGE_KEY = "cartbudget-calculator-position";

function formatDisplay(value: string) {
  if (value === "Error") return value;
  const [integerPart, decimalPart] = value.split(".");
  const formattedInteger = Number(integerPart || 0).toLocaleString("es-SV");
  return decimalPart === undefined ? formattedInteger : `${formattedInteger}.${decimalPart}`;
}

function calculate(left: number, operator: Operator, right: number) {
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  if (operator === "×") return left * right;
  if (right === 0) return null;
  return left / right;
}

function clampPosition(position: Position, width: number, height: number): Position {
  return {
    left: Math.min(Math.max(12, position.left), Math.max(12, window.innerWidth - width - 12)),
    top: Math.min(Math.max(12, position.top), Math.max(12, window.innerHeight - height - 12)),
  };
}

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [display, setDisplay] = React.useState("0");
  const [storedValue, setStoredValue] = React.useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = React.useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = React.useState(false);
  const [position, setPosition] = React.useState<Position | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const calculatorRef = React.useRef<HTMLDivElement>(null);
  const dragOffset = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    try {
      const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
      if (savedPosition) setPosition(JSON.parse(savedPosition) as Position);
    } catch {
      // La calculadora sigue funcionando aunque el almacenamiento local no esté disponible.
    }
  }, []);

  React.useEffect(() => {
    if (!position) return;
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  const reset = React.useCallback(() => {
    setDisplay("0");
    setStoredValue(null);
    setPendingOperator(null);
    setWaitingForOperand(false);
  }, []);

  const inputDigit = React.useCallback(
    (digit: string) => {
      setDisplay((currentDisplay) => {
        if (currentDisplay === "Error" || waitingForOperand) {
          setWaitingForOperand(false);
          return digit;
        }
        if (currentDisplay === "0") return digit;
        if (currentDisplay.replace("-", "").replace(".", "").length >= 12) return currentDisplay;
        return `${currentDisplay}${digit}`;
      });
    },
    [waitingForOperand],
  );

  const inputDecimal = React.useCallback(() => {
    setDisplay((currentDisplay) => {
      if (currentDisplay === "Error" || waitingForOperand) {
        setWaitingForOperand(false);
        return "0.";
      }
      return currentDisplay.includes(".") ? currentDisplay : `${currentDisplay}.`;
    });
  }, [waitingForOperand]);

  const chooseOperator = React.useCallback(
    (operator: Operator) => {
      const currentValue = Number(display);
      if (!Number.isFinite(currentValue)) {
        reset();
        return;
      }
      if (storedValue !== null && pendingOperator && !waitingForOperand) {
        const result = calculate(storedValue, pendingOperator, currentValue);
        if (result === null || !Number.isFinite(result)) {
          setDisplay("Error");
          setStoredValue(null);
          setPendingOperator(null);
          return;
        }
        setDisplay(String(result));
        setStoredValue(result);
      } else {
        setStoredValue(currentValue);
      }
      setPendingOperator(operator);
      setWaitingForOperand(true);
    },
    [display, pendingOperator, reset, storedValue, waitingForOperand],
  );

  const equals = React.useCallback(() => {
    if (storedValue === null || !pendingOperator) return;
    const result = calculate(storedValue, pendingOperator, Number(display));
    if (result === null || !Number.isFinite(result)) {
      setDisplay("Error");
    } else {
      setDisplay(String(result));
    }
    setStoredValue(null);
    setPendingOperator(null);
    setWaitingForOperand(true);
  }, [display, pendingOperator, storedValue]);

  const backspace = () => {
    setDisplay((currentDisplay) => {
      if (currentDisplay === "Error" || currentDisplay.length <= 1) return "0";
      return currentDisplay.slice(0, -1);
    });
  };

  const toggleSign = () => {
    setDisplay((currentDisplay) => {
      if (currentDisplay === "0" || currentDisplay === "Error") return currentDisplay;
      return currentDisplay.startsWith("-") ? currentDisplay.slice(1) : `-${currentDisplay}`;
    });
  };

  const percentage = () => {
    setDisplay((currentDisplay) => String(Number(currentDisplay) / 100));
  };

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      const key = event.key;
      if (/^[0-9]$/.test(key)) inputDigit(key);
      else if (key === "." || key === ",") inputDecimal();
      else if (key === "+" || key === "-" || key === "*" || key === "/") {
        chooseOperator(key === "*" ? "×" : key === "/" ? "÷" : key);
      } else if (key === "Enter" || key === "=") equals();
      else if (key === "Backspace") backspace();
      else if (key === "%") percentage();
      else if (key === "Escape") setIsOpen(false);
      else return;
      event.preventDefault();
    },
    [chooseOperator, equals, inputDecimal, inputDigit, isOpen],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    const calculator = calculatorRef.current;
    if (!calculator) return;
    const bounds = calculator.getBoundingClientRect();
    setPosition({ left: bounds.left, top: bounds.top });
    dragOffset.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || !calculatorRef.current) return;
    const bounds = calculatorRef.current.getBoundingClientRect();
    const nextPosition = clampPosition(
      { left: event.clientX - dragOffset.current.x, top: event.clientY - dragOffset.current.y },
      bounds.width,
      bounds.height,
    );
    setPosition(nextPosition);
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label="Abrir calculadora"
          aria-expanded={false}
          onClick={() => setIsOpen(true)}
          className="bg-accent text-accent-foreground focus-visible:ring-ring fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95"
        >
          <Calculator className="size-6" />
        </button>
      )}

      {isOpen && (
        <section
          ref={calculatorRef}
          aria-label="Calculadora"
          className={cn(
            "border-border bg-card text-card-foreground fixed right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border shadow-2xl",
            "max-h-[calc(100dvh-6rem)]",
            isDragging && "select-none",
          )}
          style={
            position
              ? { left: position.left, top: position.top, right: "auto", bottom: "auto" }
              : undefined
          }
        >
          <div className="border-border bg-muted/60 flex items-center justify-between border-b px-4 py-2.5">
            <button
              type="button"
              aria-label="Mover calculadora"
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              className="flex min-h-10 flex-1 cursor-grab touch-none items-center gap-2 text-left text-sm font-semibold active:cursor-grabbing"
            >
              <Grip className="text-muted-foreground size-4" />
              Calculadora
            </button>
            <button
              type="button"
              aria-label="Cerrar calculadora"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-xl focus-visible:ring-2"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-3 p-3">
            <output
              aria-live="polite"
              className="bg-foreground font-display text-background block min-h-16 overflow-x-auto rounded-2xl px-4 py-3 text-right text-3xl font-bold tracking-tight"
            >
              {formatDisplay(display)}
            </output>

            <div className="grid grid-cols-4 gap-2">
              <CalculatorButton label="Borrar todo" onClick={reset} variant="muted">
                AC
              </CalculatorButton>
              <CalculatorButton label="Borrar último dígito" onClick={backspace} variant="muted">
                <Delete />
              </CalculatorButton>
              <CalculatorButton label="Porcentaje" onClick={percentage} variant="muted">
                <Percent />
              </CalculatorButton>
              <CalculatorButton
                label="Dividir"
                onClick={() => chooseOperator("÷")}
                variant="operator"
              >
                <Divide />
              </CalculatorButton>
              {(["7", "8", "9"] as const).map((digit) => (
                <CalculatorButton key={digit} label={digit} onClick={() => inputDigit(digit)}>
                  {digit}
                </CalculatorButton>
              ))}
              <CalculatorButton
                label="Multiplicar"
                onClick={() => chooseOperator("×")}
                variant="operator"
              >
                <X />
              </CalculatorButton>
              {(["4", "5", "6"] as const).map((digit) => (
                <CalculatorButton key={digit} label={digit} onClick={() => inputDigit(digit)}>
                  {digit}
                </CalculatorButton>
              ))}
              <CalculatorButton
                label="Restar"
                onClick={() => chooseOperator("-")}
                variant="operator"
              >
                <Minus />
              </CalculatorButton>
              {(["1", "2", "3"] as const).map((digit) => (
                <CalculatorButton key={digit} label={digit} onClick={() => inputDigit(digit)}>
                  {digit}
                </CalculatorButton>
              ))}
              <CalculatorButton
                label="Sumar"
                onClick={() => chooseOperator("+")}
                variant="operator"
              >
                <Plus />
              </CalculatorButton>
              <CalculatorButton label="Cambiar signo" onClick={toggleSign}>
                +/-
              </CalculatorButton>
              <CalculatorButton label="Cero" onClick={() => inputDigit("0")}>
                0
              </CalculatorButton>
              <CalculatorButton label="Decimal" onClick={inputDecimal}>
                .
              </CalculatorButton>
              <CalculatorButton label="Calcular resultado" onClick={equals} variant="equals">
                <Equal />
              </CalculatorButton>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function CalculatorButton({
  children,
  label,
  onClick,
  variant = "number",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "number" | "muted" | "operator" | "equals";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-ring flex h-12 items-center justify-center rounded-2xl text-base font-bold transition-transform focus-visible:ring-2 active:scale-95",
        variant === "number" && "bg-secondary text-secondary-foreground hover:bg-muted",
        variant === "muted" && "bg-muted text-muted-foreground hover:bg-secondary",
        variant === "operator" && "bg-accent text-accent-foreground hover:opacity-90",
        variant === "equals" && "bg-primary text-primary-foreground hover:opacity-90",
      )}
    >
      {children}
    </button>
  );
}
