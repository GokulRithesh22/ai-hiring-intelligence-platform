export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function truncateText(text: string | undefined, maxLength = 18_000): string {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n...[truncated for prompt safety]`;
}

export function normalizeWhitespace(text: string | undefined): string {
  if (!text) {
    return "";
  }

  return text.replace(/\s+/g, " ").trim();
}

export function listToSentence(items: string[]): string {
  if (items.length === 0) {
    return "None provided.";
  }

  return items.join(", ");
}

export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
