import { once } from 'node:events';
import { createApp } from '../src/app.js';
export async function fixture(t, options) {
  const server = createApp({ token: 'test_token_' + 'a'.repeat(32), ...options });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return async (path, options = {}) => {
    const res = await fetch(base + path, { ...options, headers: { authorization: 'Bearer test_token_' + 'a'.repeat(32), ...options.headers } });
    return { status: res.status, body: await res.json() };
  };
}
export const post = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
