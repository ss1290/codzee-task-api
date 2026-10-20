import { Readable } from 'node:stream';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, post } from './helpers.js';
test('rejects invalid shapes, unknown fields and invalid titles without creating tasks', async t => {
  const request = await fixture(t);
  for (const body of [null, [], {}, { title: 2 }, { title: ' ' }, { title: 'x'.repeat(201) }, { title: 'Valid', completed: true }]) {
    assert.equal((await request('/tasks', post(body))).status, 400);
  }
  assert.equal((await request('/tasks')).body.items.length, 0);
});
test('enforces media type, encoding and valid UTF-8', async t => {
  const request = await fixture(t);
  assert.equal((await request('/tasks', { method: 'POST', body: '{}' })).status, 415);
  assert.equal((await request('/tasks', { ...post({ title: 'ok' }), headers: { 'content-type': 'application/json', 'content-encoding': 'gzip' } })).status, 415);
  assert.equal((await request('/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: Buffer.from([0xff]) })).status, 400);
  assert.equal((await request('/tasks', { ...post({ title: 'ok' }), headers: { 'content-type': 'application/json; charset=utf-8' } })).status, 201);
});
test('limits bytes rather than characters and server remains usable after rejection', async t => {
  const request = await fixture(t);
  assert.equal((await request('/tasks', post({ title: 'a'.repeat(20000) }))).status, 413);
  assert.equal((await request('/tasks', post({ title: '\u{1F600}'.repeat(5000) }))).status, 413);
  assert.equal((await request('/tasks', post({ title: '\u{1F600}'.repeat(200) }))).status, 201);
  assert.equal((await request('/health')).status, 200);
  assert.equal((await request('/tasks')).body.items.length, 1);
});

test('streamed JSON accepts exactly 16 KiB and rejects the next byte', async t => {
  const request = await fixture(t);
  const json = JSON.stringify({ title: 'Boundary task' });
  const bodyOfSize = size => json + ' '.repeat(size - Buffer.byteLength(json));
  const streamed = text => ({ method: 'POST', headers: { 'content-type': 'application/json' },
    body: Readable.from([Buffer.from(text.slice(0, 8000)), Buffer.from(text.slice(8000))]), duplex: 'half' });
  assert.equal((await request('/tasks', streamed(bodyOfSize(16384)))).status, 201);
  assert.equal((await request('/tasks', streamed(bodyOfSize(16385)))).status, 413);
  assert.equal((await request('/tasks', { ...post({ title: 'Wrong charset' }), headers: { 'content-type': 'application/json; charset=latin1' } })).status, 415);
  assert.equal((await request('/tasks')).body.items.length, 1);
});
