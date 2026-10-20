import { createAuthorizer } from './auth.js';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

export function createApp({ token = process.env.API_TOKEN } = {}) {
  const authorized = createAuthorizer(token);
  const tasks = new Map();
  return createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };
    try {
      if (req.method === 'GET' && /^\/health(?:\?|$)/.test(req.url)) return send(200, { status: 'ok' });
      if (!authorized(req.headers.authorization)) {
        req.resume();
        res.setHeader('WWW-Authenticate', 'Bearer');
        return send(401, { error: 'Unauthorized' });
      }
      res.setHeader('Cache-Control', 'no-store');
      let url;
      try { url = new URL(req.url, 'http://localhost'); }
      catch { return send(400, { error: 'Invalid request URL' }); }
      if (req.method === 'GET' && url.pathname === '/tasks') {
        return send(200, { items: [...tasks.values()] });
      }
      if (req.method === 'POST' && url.pathname === '/tasks') {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        let body;
        try { body = JSON.parse(raw); } catch { return send(400, { error: 'Invalid JSON' }); }
        if (!body || typeof body.title !== 'string' || !body.title.trim()) {
          return send(400, { error: 'A non-empty title is required' });
        }
        const task = { id: randomUUID(), title: body.title.trim(), completed: false, createdAt: new Date().toISOString() };
        tasks.set(task.id, task);
        return send(201, task);
      }
      const match = /^\/tasks\/([^/]+)$/.exec(url.pathname);
      if (match && req.method === 'GET') {
        const task = tasks.get(match[1]);
        return task ? send(200, task) : send(404, { error: 'Task not found' });
      }
      if (match && req.method === 'DELETE') {
        return tasks.delete(match[1]) ? send(200, { deleted: true }) : send(404, { error: 'Task not found' });
      }
      return send(404, { error: 'Route not found' });
    } catch {
      if (!res.headersSent) send(500, { error: 'Internal server error' });
      else res.destroy();
    }
  });
}
