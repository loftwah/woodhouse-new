import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicationAuditScope, auditScopeArguments } from './publication-audit-scope.mjs';

test('routine audits name affected local routes and broad audits remain available', () => {
  assert.deepEqual(publicationAuditScope([]), ['/']);
  assert.deepEqual(publicationAuditScope(['--path=/projects/foilbury/', '--path=/projects/foilbury/']), ['/projects/foilbury/']);
  assert.equal(publicationAuditScope(['--full-audit']), null);
  assert.deepEqual(auditScopeArguments(['/projects/foilbury/']), ['--path=/projects/foilbury/']);
  assert.deepEqual(auditScopeArguments(null), []);
  assert.throws(() => publicationAuditScope(['--path=//other.example/']));
  assert.throws(() => publicationAuditScope(['--full-audit', '--path=/']));
  assert.throws(() => auditScopeArguments(undefined));
});
