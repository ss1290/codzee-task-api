# Search and pagination

`GET /tasks?q=review&completed=false&sort=title&order=asc&offset=0&limit=20`

Search is a case-insensitive substring match. Empty search matches all tasks.
Filter by `completed=true` or `false`. Creation currently creates incomplete tasks only; completed filtering also supports future task update operations.
Sort accepts `title` or `createdAt`; order accepts `asc` or `desc`. IDs break ties deterministically. Title sorting uses JavaScript lexical ordering, not locale collation.
`total` is the filtered count before pagination. Offset defaults to 0; limit defaults to 20 and must be 1?100. Invalid, unknown, and repeated query parameters return 400.
This is an in-memory local API: pagination is not a snapshot across concurrent writes.
