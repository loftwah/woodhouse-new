const scriptEscapes: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};

export function toJsonLd(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) throw new TypeError("JSON-LD value must be serializable.");
  return json.replace(/[<>&\u2028\u2029]/g, (character) => scriptEscapes[character] ?? character);
}
