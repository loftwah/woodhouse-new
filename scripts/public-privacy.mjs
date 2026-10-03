const PRIVATE_EMAIL = /\b[A-Z0-9._%+-]+@deanlofts\.xyz\b/i;
const PUBLIC_MARKERS = [
  ["private email domain", "@deanlofts.xyz"],
  ["EmDash environment marker", "EMDASH_"],
  ["EmDash API token prefix", "ec_pat_"],
  ["Resend secret name", "RESEND_API_KEY"]
];

export function scanPublicText(value, { privateValues = [], includeMarkers = true } = {}) {
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
  const findings = [];
  if (PRIVATE_EMAIL.test(text)) findings.push("private email address");
  for (const privateValue of privateValues) {
    if (
      typeof privateValue === "string" &&
      privateValue.length >= 8 &&
      text.includes(privateValue)
    ) {
      findings.push("configured private value");
      break;
    }
  }
  if (includeMarkers) {
    for (const [label, marker] of PUBLIC_MARKERS) {
      if (text.includes(marker)) findings.push(label);
    }
  }
  return [...new Set(findings)];
}
