# Bearer authentication

Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
Set `API_TOKEN` to that value in your shell and run `npm start`. The process fails at startup if the token is missing or malformed. Never commit the value.

All routes except GET `/health` require `Authorization: Bearer <API_TOKEN>`. Authentication runs before parsing task bodies or looking up tasks. Invalid credentials receive the same 401 response and WWW-Authenticate challenge. Responses to authenticated requests disable caching.

Token digests use constant-length timing-safe comparison. This does not promise constant timing for the entire HTTP request. Use HTTPS if deployed beyond localhost. This is a shared service token, not multi-user authorization: all holders share the same task collection. Restarting with a new token rotates credentials and also clears the in-memory store. Use a secrets manager for deployed configuration.

Tests supply a clearly synthetic token; no real credentials are included.
