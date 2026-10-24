// Reviewed for #123: optional locally, retained when already installed remotely.
export const requiredWorkerSecrets = ["RESEND_API_KEY", "EMDASH_ENCRYPTION_KEY"];
export const approvedWorkerSecrets = [...requiredWorkerSecrets, "WOODHOUSE_GITHUB_TOKEN"];
export function assertApprovedSecrets(values) {
  for (const [name, value] of values) {
    if (/(?:key|token|secret|password)/i.test(name) && !approvedWorkerSecrets.includes(name))
      throw new Error(`Refusing unreviewed local secret ${name}.`);
    if (approvedWorkerSecrets.includes(name) && (!value.trim() || /[\r\n]/.test(value)))
      throw new Error(`Refusing empty or multiline local secret ${name}.`);
  }
}
