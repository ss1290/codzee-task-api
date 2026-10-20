import test from 'node:test';
import assert from 'node:assert/strict';
import { queryTasks } from '../src/query.js';
import { fixture, post } from './helpers.js';
const tasks = [
  { id: 'b', title: 'Beta', completed: false, createdAt: '2026-01-01' },
  { id: 'a', title: 'Alpha', completed: true, createdAt: '2026-01-01' },
  { id: 'c', title: 'Alpha', completed: false, createdAt: '2026-01-02' },
];
const query = raw => queryTasks(tasks, new URLSearchParams(raw));
test('filters by case-insensitive text and boolean before counting and paging', () => {
  assert.deepEqual(query('q=ALP&completed=false').items.map(t => t.id), ['c']);
  assert.equal(query('q=alpha&limit=1').total, 2);
  assert.deepEqual(query('sort=title&order=desc&offset=1&limit=1').items.map(t => t.id), ['c']);
  assert.equal(query('offset=100').items.length, 0);
  assert.equal(query('q=%20').total, 3);
});
test('tie order is deterministic and input order is preserved', () => {
  assert.deepEqual(query('').items.map(t => t.id), ['a', 'b', 'c']);
  assert.deepEqual(tasks.map(t => t.id), ['b', 'a', 'c']);
});
test('rejects invalid and duplicate query parameters', () => {
  for (const raw of ['limit=0','limit=101','offset=-1','limit=1.2','offset=9007199254740992','completed=1','sort=id','order=up','limit=1&limit=2','unknown=1','limit=','q='+'x'.repeat(201)]) {
    assert.throws(() => query(raw), undefined, raw);
  }
});
test('HTTP endpoint applies filters and reports client errors', async t => {
  const request = await fixture(t);
  await request('/tasks', post({ title: 'Beta' }));
  await request('/tasks', post({ title: 'Alpha' }));
  const result = await request('/tasks?q=alp&limit=1');
  assert.equal(result.status, 200); assert.equal(result.body.total, 1);
  assert.equal(result.body.items[0].title, 'Alpha');
  assert.equal((await request('/tasks?limit=-1')).status, 400);
});
