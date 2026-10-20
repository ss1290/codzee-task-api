import { createHash, timingSafeEqual } from 'node:crypto';
export function createAuthorizer(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
    throw new Error('API_TOKEN must be 32 to 256 URL-safe alphanumeric, underscore or hyphen characters');
  }
  const expected = createHash('sha256').update(token).digest();
  return header => {
    const match = /^Bearer ([A-Za-z0-9_-]{32,256})$/i.exec(header ?? '');
    if (!match) return false;
    return timingSafeEqual(expected, createHash('sha256').update(match[1]).digest());
  };
}
