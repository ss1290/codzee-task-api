import { readTask, RequestError } from './validation.js';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

export function createApp() {
  const tasks = new Map();
  return createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') return send(200, { status: 'ok' });
      if (req.method === 'GET' && url.pathname === '/tasks') {
        return send(200, { items: [...tasks.values()] });
      }
      if (req.method === 'POST' && url.pathname === '/tasks') {
        const body = await readTask(req);
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
    } catch (error) {
      if (error instanceof RequestError) return send(error.status, { error: error.message });
      if (!res.headersSent) send(500, { error: 'Internal server error' });
      else res.destroy();
    }
  });
}
