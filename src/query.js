export function queryTasks(tasks, params) {
  const allowed = new Set(['q', 'completed', 'sort', 'order', 'offset', 'limit']);
  for (const key of params.keys()) {
    if (!allowed.has(key) || params.getAll(key).length !== 1) throw new Error(`Invalid query parameter: ${key}`);
  }
  const integer = (key, fallback, min, max) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    if (!/^(0|[1-9][0-9]*)$/.test(raw)) throw new Error(`Invalid ${key}`);
    const n = Number(raw);
    if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`Invalid ${key}`);
    return n;
  };
  const offset = integer('offset', 0, 0, Number.MAX_SAFE_INTEGER);
  const limit = integer('limit', 20, 1, 100);
  const completed = params.get('completed');
  if (completed !== null && !['true', 'false'].includes(completed)) throw new Error('Invalid completed');
  const sort = params.get('sort') ?? 'createdAt';
  const order = params.get('order') ?? 'asc';
  if (!['createdAt', 'title'].includes(sort) || !['asc', 'desc'].includes(order)) throw new Error('Invalid sorting');
  const query = (params.get('q') ?? '').trim().toLowerCase();
  if (query.length > 200) throw new Error('Search query is too long');
  const filtered = tasks.filter(task => task.title.toLowerCase().includes(query) &&
    (completed === null || task.completed === (completed === 'true')));
  const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  filtered.sort((a, b) => (compare(a[sort], b[sort]) || compare(a.id, b.id)) * (order === 'asc' ? 1 : -1));
  return { items: filtered.slice(offset, offset + limit), total: filtered.length, offset, limit };
}
