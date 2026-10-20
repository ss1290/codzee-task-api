import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, post } from './helpers.js';
test('create, retrieve, list and delete a task through HTTP', async t => {
  const request = await fixture(t);
  assert.equal((await request('/health')).status, 200);
  const created = await request('/tasks', post({ title: '  Review code  ' }));
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Review code');
  assert.equal((await request(`/tasks/${created.body.id}`)).body.id, created.body.id);
  assert.equal((await request('/tasks')).body.items.length, 1);
  assert.equal((await request(`/tasks/${created.body.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await request(`/tasks/${created.body.id}`)).status, 404);
});
test('malformed input and unknown routes return useful errors', async t => {
  const request = await fixture(t);
  assert.equal((await request('/tasks', post({ title: ' ' }))).status, 400);
  assert.equal((await request('/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await request('/missing')).status, 404);
});
