# Search and pagination

`GET /tasks?q=review&completed=false&sort=title&order=asc&offset=0&limit=20`

Search trims leading and trailing whitespace, then performs a case-insensitive substring match. Empty or whitespace-only search matches all tasks. Queries longer than 200 UTF-16 code units after trimming and lowercasing return 400.
Filter by `completed=true` or `false`. Creation currently creates incomplete tasks only; completed filtering also supports future task update operations.
Sort accepts `title` or `createdAt`; order accepts `asc` or `desc`. IDs break ties deterministically for the same stored collection. UUID order does not imply creation order when timestamps tie; this API does not promise chronological ordering within one millisecond. Title sorting uses JavaScript lexical ordering, not locale collation.
`total` is the filtered count before pagination. Offset defaults to 0; limit defaults to 20 and must be 1?100. Invalid, unknown, and repeated query parameters return 400.
This is an in-memory local API: pagination is not a snapshot across concurrent writes.
