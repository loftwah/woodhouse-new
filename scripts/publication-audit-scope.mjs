// Publication audits default to a small reader journey; callers name affected
// routes, or request the full sitemap for shared, schema or broad changes.
export function publicationAuditScope(args) {
  const full = args.includes('--full-audit');
  const paths = args.filter((arg) => arg.startsWith('--path=')).map((arg) => arg.slice(7));
  if (full && paths.length) throw Error('Choose --full-audit or --path, not both.');
  if (paths.some((p) => !p.startsWith('/') || p.startsWith('//') || /[\\#\r\n]/.test(p)))
    throw Error('Audit paths must be local absolute paths.');
  return full ? null : [...new Set(paths.length ? paths : ['/'])];
}
export function auditScopeArguments(scope) {
  if (scope === null) return [];
  if (!Array.isArray(scope) || scope.length === 0 || scope.some((p) => typeof p !== 'string'))
    throw Error('Invalid preview audit scope.');
  const validated = publicationAuditScope(scope.map((p) => `--path=${p}`));
  return validated.map((p) => `--path=${p}`);
}
