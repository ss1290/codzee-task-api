import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createAuthorizer } from '../src/auth.js';
import { fixture, post } from './helpers.js';
test('configuration fails closed without a valid secret', () => {
  for (const token of ['', 'short', ' '.repeat(32), 'x'.repeat(257)]) assert.throws(() => createApp({ token }));
  assert.throws(() => createAuthorizer(undefined));
});
test('unauthorized clients cannot list, read, create or delete tasks', async t => {
  const request = await fixture(t);
  const created = await request('/tasks', post({ title: 'Private task' }));
  for (const authorization of ['', 'Basic abc', 'Bearer '+'z'.repeat(32), 'Bearer '+'z'.repeat(257)]) {
    const headers = { authorization };
    for (const path of ['/tasks', `/tasks/${created.body.id}`]) {
      const result = await request(path, { headers });
      assert.equal(result.status, 401);
      assert.deepEqual(result.body, { error: 'Unauthorized' });
    }
    assert.equal((await request('/tasks', { ...post({ title: 'Bad' }), headers: { ...headers, 'content-type': 'application/json' } })).status, 401);
    assert.equal((await request(`/tasks/${created.body.id}`, { method: 'DELETE', headers })).status, 401);
  }
  assert.equal((await request('/tasks')).body.items.length, 1);
  assert.equal((await request('/health', { headers: { authorization: '' } })).status, 200);
  assert.equal((await request(`/tasks/${created.body.id}`, { method: 'DELETE' })).status, 200);
});
test('bearer scheme is case insensitive, credentials are exact', () => {
  const token = 'A'.repeat(32), check = createAuthorizer(token);
  assert.equal(check('bearer '+token), true);
  assert.equal(check('Bearer '+token.toLowerCase()), false);
  assert.equal(check('Bearer '+token+' '), false);
});
