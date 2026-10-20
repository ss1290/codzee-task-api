import { TextDecoder } from 'node:util';
export class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export async function readTask(req, limit = 16 * 1024) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(req.headers['content-type'] ?? '')) {
    req.resume();
    throw new RequestError(415, 'Content-Type must be application/json with optional UTF-8 charset');
  }
  if (req.headers['content-encoding'] && req.headers['content-encoding'].toLowerCase() !== 'identity') {
    req.resume();
    throw new RequestError(415, 'Compressed request bodies are not supported');
  }
  const chunks = [];
  let size = 0;
  // Read with data events so an early rejection does not destroy the socket before the 413 response.
  const bytes = await new Promise((resolve, reject) => {
    const cleanup = () => {
      req.off('data', onData); req.off('end', onEnd);
      req.off('aborted', onAbort); req.off('error', onError);
    };
    const onData = chunk => {
      size += chunk.length;
      if (size > limit) {
        cleanup(); req.resume();
        reject(new RequestError(413, 'Request body exceeds 16384 bytes'));
      } else chunks.push(chunk);
    };
    const onEnd = () => { cleanup(); resolve(Buffer.concat(chunks)); };
    const onAbort = () => { cleanup(); reject(new RequestError(400, 'Request aborted')); };
    const onError = error => { cleanup(); reject(error); };
    req.on('data', onData); req.once('end', onEnd);
    req.once('aborted', onAbort); req.once('error', onError);
  });
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new RequestError(400, 'Body must be valid UTF-8 JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError(400, 'Body must be a JSON object');
  if (Object.keys(body).some(key => key !== 'title')) throw new RequestError(400, 'Unknown task field');
  if (typeof body.title !== 'string' || !body.title.trim() || [...body.title.trim()].length > 200) {
    throw new RequestError(400, 'Title must contain 1 to 200 Unicode code points after trimming');
  }
  return { title: body.title.trim() };
}
