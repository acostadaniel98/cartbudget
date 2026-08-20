"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFrequentSuggestions } from "@/features/frequent-products/hooks/use-frequent-suggestions";
import type { FrequentProduct } from "@/domain/models/frequent-product";
import { cn } from "@/lib/utils";

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (product: FrequentProduct) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ProductAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Ej. Leche, Tomate, Papel higiénico…",
  autoFocus,
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const suggestions = useFrequentSuggestions(value, 5);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showSuggestions = isOpen && suggestions.length > 0;
  const listboxId = "producto-sugerencias";

  React.useEffect(() => {
    setActiveIndex(0);
  }, [value, suggestions.length]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
          onKeyDown={(event) => {
            if (!showSuggestions) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              onSelectSuggestion(suggestions[activeIndex]);
              setIsOpen(false);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setIsOpen(false);
            }
          }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-activedescendant={showSuggestions ? `${listboxId}-${activeIndex}` : undefined}
      />
      {showSuggestions && (
        <ul
            id={listboxId}
          role="listbox"
          className={cn(
            "absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg",
          )}
        >
          {suggestions.map((product, index) => (
            <li key={product.id}>
              <button
                type="button"
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => {
                  onSelectSuggestion(product);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors hover:bg-muted active:bg-muted"
              >
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-medium">{product.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
