import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { leaderboardInsertSql } from './leaderboard-sql.mjs';

test('large reports round-trip and retries do not change a published snapshot', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE wh_analytics_reports(id TEXT PRIMARY KEY, created_at TEXT, days INTEGER, body TEXT)');
  const report = { id: 'test', collectedAt: '2026-11-05', text: 'x'.repeat(11999) + "😀'" + 'y'.repeat(25000) };
  const sql = leaderboardInsertSql(report);
  db.exec(sql);
  const row = db.prepare('SELECT days, body FROM wh_analytics_reports').get();
  assert.equal(row.days, 0);
  assert.deepEqual(JSON.parse(row.body), report);
  db.exec(sql);
  assert.equal(db.prepare('SELECT body FROM wh_analytics_reports').get().body, row.body);
});
