export function requireRow<T>(rows: T[]): T {
  const row = rows[0];
  if (!row) throw new Error("query returned no rows");
  return row;
}
