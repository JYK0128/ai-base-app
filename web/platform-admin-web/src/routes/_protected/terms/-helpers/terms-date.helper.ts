function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function formatDateTime(dateString?: string | null): string {
  const date = toDate(dateString);
  if (!date) return '-';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toDatetimeLocalValue(dateString?: string | null): string {
  const date = toDate(dateString);
  if (!date) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toIsoDateString(dateString?: string | null): string {
  const date = toDate(dateString);
  return date ? date.toISOString() : new Date().toISOString();
}

export function defaultTermsVersionEffectiveAtInput(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}
