import { SITE_CONFIG } from "@/config/site";

const currencyFormatter = new Intl.NumberFormat(SITE_CONFIG.locale, {
  style: "currency",
  currency: SITE_CONFIG.moneda,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat(SITE_CONFIG.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp));
}

const dateTimeFormatter = new Intl.DateTimeFormat(SITE_CONFIG.locale, {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(new Date(timestamp));
}

export function formatMonthLabel(mesKey: string): string {
  const [year, month] = mesKey.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return new Intl.DateTimeFormat(SITE_CONFIG.locale, { month: "long", year: "numeric" }).format(
    date,
  );
}

export function formatRelativeDay(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(now, date)) return "Hoy";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(yesterday, date)) return "Ayer";

  return formatDate(timestamp);
}
