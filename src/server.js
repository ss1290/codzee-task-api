import { createApp } from './app.js';
const port = Number(process.env.PORT ?? 3000);
const server = createApp();
server.listen(port, '127.0.0.1', () => console.log(`Task API listening on http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { server.close(); server.closeIdleConnections(); });
}
