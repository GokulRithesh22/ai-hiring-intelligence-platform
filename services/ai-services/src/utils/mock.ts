export function scoreFromText(input: string, baseline = 72) {
  const modifier = Math.min(18, Math.max(-10, Math.round(input.length / 50)));
  return Math.max(45, Math.min(96, baseline + modifier));
}
