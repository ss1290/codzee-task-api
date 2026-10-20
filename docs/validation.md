# Request validation

POST `/tasks` accepts only an object with a `title` string. Unknown fields are rejected, preventing accidental writable properties. Titles are trimmed and must contain 1?200 Unicode code points.

The server accepts application/json with an optional UTF-8 charset. Other media types, charsets, and compressed bodies receive 415. Invalid UTF-8, malformed JSON, and invalid task fields receive 400. Bodies above 16 KiB receive 413; bytes are counted as the request arrives, including chunked requests. Rejected input never creates a task.

This body limit bounds buffered payloads. It does not substitute for deployment-level connection limits, request timeouts, authentication, or rate limiting.
