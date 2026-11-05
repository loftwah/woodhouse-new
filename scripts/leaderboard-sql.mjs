// D1 rejects a single large INSERT. Keep the report hidden until every chunk is
// written; retries leave an already published report untouched.
export function leaderboardInsertSql(snapshot) {
  const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
  const id = quote(snapshot.id);
  const chunks = Array.from(JSON.stringify(snapshot));
  const lines = [
    `INSERT OR IGNORE INTO wh_analytics_reports(id,created_at,days,body) VALUES(${id},${quote(snapshot.collectedAt)},-3,'');`,
    `UPDATE wh_analytics_reports SET body='' WHERE id=${id} AND days=-3;`
  ];
  for (let i = 0; i < chunks.length; i += 12000)
    lines.push(`UPDATE wh_analytics_reports SET body=body||${quote(chunks.slice(i, i + 12000).join(''))} WHERE id=${id} AND days=-3;`);
  lines.push(`UPDATE wh_analytics_reports SET days=0 WHERE id=${id} AND days=-3;`);
  return lines.join('\n') + '\n';
}
